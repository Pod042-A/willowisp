import {
    StructureType,
    type ArrayStructure,
    type ExtendStructure,
    type ObjectStructure,
    type Primitive,
    type PrimitiveStructure,
    type ReferenceStructure,
    type Structure,
} from "./structure";

type ExtendValidator = <T>(value: unknown) => value is T;

class Guard {
    private static _register: Map<symbol, Structure> = new Map();
    private static _validator: Map<symbol, ExtendValidator> = new Map();

    private constructor() {}

    public static set(key: string, struct: Structure): symbol {
        if (!Guard.Validator.isStructure(struct)) {
            throw new Error("Invalid structure cannot be set");
        }
        const symbol = Symbol(key);
        Guard._register.set(symbol, struct);
        return symbol;
    }

    public static get(key: symbol): Structure | undefined {
        return Guard._register.get(key);
    }

    public static assert<T>(obj: unknown, struct: symbol | Structure): obj is T {
        const structure = typeof struct === "symbol" ? Guard.get(struct) : struct;

        if (!structure) {
            throw new Error("Invalid structure or not found");
        }

        return Guard.Validator.validate(obj, structure);
    }

    protected static Validator = {
        isObject(obj: unknown): obj is object {
            return obj !== null && typeof obj === "object";
        },
        isPrimitive(type: unknown): type is Primitive {
            return type === "string" || type === "number" || type === "boolean" || type === "null";
        },
        isStructure(struct: unknown): struct is Structure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if ("$optional" in struct && typeof struct.$optional !== "boolean") {
                return false;
            }

            if (!("$relation" in struct && (struct.$relation === "AND" || struct.$relation === "OR"))) {
                return false;
            }

            if (!("$types" in struct && Array.isArray(struct.$types) && struct.$types.length > 0)) {
                return false;
            }

            return struct.$types.every((s: unknown) => {
                if (!Guard.Validator.isObject(s)) {
                    return false;
                }

                if (!("$kind" in s)) {
                    return false;
                }

                switch (s.$kind) {
                    case StructureType.Primitive:
                        return Guard.Validator.isPrimitiveStructure(s);
                    case StructureType.Array:
                        return Guard.Validator.isArrayStructure(s);
                    case StructureType.Object:
                        return Guard.Validator.isObjectStructure(s);
                    case StructureType.Reference:
                        return Guard.Validator.isReferenceStructure(s);
                    case StructureType.Extend:
                        return Guard.Validator.isExtendStructure(s);
                    default:
                        return false;
                }
            });
        },
        isPrimitiveStructure(struct: unknown): struct is PrimitiveStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === StructureType.Primitive)) {
                return false;
            }

            if (!("$value" in struct && Guard.Validator.isPrimitive(struct.$value))) {
                return false;
            }

            return true;
        },
        isArrayStructure(struct: unknown): struct is ArrayStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === StructureType.Array)) {
                return false;
            }

            if (!("$value" in struct && Guard.Validator.isStructure(struct.$value))) {
                return false;
            }

            return true;
        },
        isObjectStructure(struct: unknown): struct is ObjectStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === StructureType.Object)) {
                return false;
            }

            if ("$additional" in struct && typeof struct.$additional !== "boolean") {
                return false;
            }

            if (!("$value" in struct && Guard.Validator.isObject(struct.$value))) {
                return false;
            }

            return Object.entries(struct.$value).every(
                ([k, s]) => typeof k === "string" && Guard.Validator.isStructure(s),
            );
        },
        isReferenceStructure(struct: unknown): struct is ReferenceStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === StructureType.Reference)) {
                return false;
            }

            if (!("$value" in struct && typeof struct.$value === "symbol")) {
                return false;
            }

            return Guard.get(struct.$value) !== undefined;
        },
        isExtendStructure(struct: unknown): struct is ExtendStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === StructureType.Extend)) {
                return false;
            }

            if (!("$value" in struct && typeof struct.$value === "symbol")) {
                return false;
            }

            return Guard.Extend.get(struct.$value) !== undefined;
        },
        validate(obj: unknown, struct: Structure): boolean {
            if (!Guard.Validator.isStructure(struct)) {
                return false;
            }

            for (const type of struct.$types) {
                let valid: boolean;

                switch (type.$kind) {
                    case StructureType.Primitive:
                        valid = Guard.Validator.validatePrimitive(obj, type);
                        break;
                    case StructureType.Array:
                        valid = Guard.Validator.validateArray(obj, type);
                        break;
                    case StructureType.Object:
                        valid = Guard.Validator.validateObject(obj, type);
                        break;
                    case StructureType.Reference:
                        valid = Guard.Validator.validateReference(obj, type);
                        break;
                    case StructureType.Extend:
                        valid = Guard.Validator.validateExtend(obj, type);
                        break;
                    default:
                        valid = false;
                }

                if (struct.$relation === "AND" && !valid) {
                    return false;
                }
                if (struct.$relation === "OR" && valid) {
                    return true;
                }
            }

            return struct.$relation === "AND";
        },
        validatePrimitive(obj: unknown, struct: PrimitiveStructure): boolean {
            switch (struct.$value) {
                case "string":
                    return typeof obj === "string";
                case "number":
                    return typeof obj === "number";
                case "boolean":
                    return typeof obj === "boolean";
                case "null":
                    return obj === null;
                default:
                    return false;
            }
        },
        validateArray(obj: unknown, struct: ArrayStructure): boolean {
            if (!Array.isArray(obj)) {
                return false;
            }

            return obj.every((el) => Guard.Validator.validate(el, struct.$value));
        },
        validateObject(obj: unknown, struct: ObjectStructure): boolean {
            if (!Guard.Validator.isObject(obj) || Array.isArray(obj)) {
                return false;
            }

            for (const [k, v] of Object.entries(struct.$value)) {
                if (!(k in obj) && !v.$optional) {
                    return false;
                }
            }

            for (const [k, v] of Object.entries(obj)) {
                if (!(k in struct.$value) && !struct.$additional) {
                    return false;
                }

                if (k in struct.$value && !Guard.Validator.validate(v, struct.$value[k])) {
                    return false;
                }
            }

            return true;
        },
        validateReference(obj: unknown, struct: ReferenceStructure): boolean {
            const ref = Guard.get(struct.$value);

            if (!ref) {
                return false;
            }

            return Guard.Validator.validate(obj, ref);
        },
        validateExtend(obj: unknown, struct: ExtendStructure): boolean {
            const ext = Guard.Extend.get(struct.$value);

            if (!ext) {
                return false;
            }

            return ext(obj);
        },
    };

    public static Extend = {
        set(key: string, validator: ExtendValidator): symbol {
            if (typeof validator !== "function") {
                throw new Error("Invalid validator cannot be set");
            }
            const symbol = Symbol(key);
            Guard._validator.set(symbol, validator);
            return symbol;
        },
        get(key: symbol): ExtendValidator | undefined {
            return Guard._validator.get(key);
        },
    };
}

export { Guard };
