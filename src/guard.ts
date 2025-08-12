import type {
    ArrayStructure,
    ObjectStructure,
    Primitive,
    PrimitiveStructure,
    ReferenceStructure,
    Structure,
} from "./structure.js";

class Guard {
    private static _register: Map<symbol, Structure> = new Map();

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

    private static Validator = class {
        private constructor() {}

        public static isObject(obj: unknown): obj is object {
            return obj !== null && typeof obj === "object";
        }

        public static isPrimitive(type: unknown): type is Primitive {
            return type === "string" || type === "number" || type === "boolean" || type === "null";
        }

        public static isStructure(struct: unknown): struct is Structure {
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

                if (
                    !(
                        "$kind" in s &&
                        (s.$kind === "PRIMITIVE" ||
                            s.$kind === "ARRAY" ||
                            s.$kind === "OBJECT" ||
                            s.$kind === "REFERENCE")
                    )
                ) {
                    return false;
                }

                switch (s.$kind) {
                    case "PRIMITIVE":
                        return Guard.Validator.isPrimitiveStructure(s);
                    case "ARRAY":
                        return Guard.Validator.isArrayStructure(s);
                    case "OBJECT":
                        return Guard.Validator.isObjectStructure(s);
                    case "REFERENCE":
                        return Guard.Validator.isReferenceStructure(s);
                    default:
                        return false;
                }
            });
        }

        public static isPrimitiveStructure(struct: unknown): struct is PrimitiveStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === "PRIMITIVE")) {
                return false;
            }

            if (!("$value" in struct && Guard.Validator.isPrimitive(struct.$value))) {
                return false;
            }

            return true;
        }

        public static isArrayStructure(struct: unknown): struct is ArrayStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === "ARRAY")) {
                return false;
            }

            if (!("$value" in struct && Guard.Validator.isStructure(struct.$value))) {
                return false;
            }

            return true;
        }

        public static isObjectStructure(struct: unknown): struct is ObjectStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === "OBJECT")) {
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
        }

        public static isReferenceStructure(struct: unknown): struct is ReferenceStructure {
            if (!Guard.Validator.isObject(struct)) {
                return false;
            }

            if (!("$kind" in struct && struct.$kind === "REFERENCE")) {
                return false;
            }

            if (!("$value" in struct && typeof struct.$value === "symbol")) {
                return false;
            }

            return Guard.get(struct.$value) !== null;
        }

        public static validate(obj: unknown, struct: Structure): boolean {
            if (!Guard.Validator.isStructure(struct)) {
                return false;
            }

            for (const type of struct.$types) {
                let valid: boolean;

                switch (type.$kind) {
                    case "PRIMITIVE":
                        valid = Guard.Validator.#validatePrimitive(obj, type);
                        break;
                    case "ARRAY":
                        valid = Guard.Validator.#validateArray(obj, type);
                        break;
                    case "OBJECT":
                        valid = Guard.Validator.#validateObject(obj, type);
                        break;
                    case "REFERENCE":
                        valid = Guard.Validator.#validateReference(obj, type);
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
        }

        static #validatePrimitive(obj: unknown, struct: PrimitiveStructure): boolean {
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
        }

        static #validateArray(obj: unknown, struct: ArrayStructure): boolean {
            if (!Array.isArray(obj)) {
                return false;
            }

            return obj.every((el) => Guard.Validator.validate(el, struct.$value));
        }

        static #validateObject(obj: unknown, struct: ObjectStructure): boolean {
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
        }

        static #validateReference(obj: unknown, struct: ReferenceStructure): boolean {
            const ref = Guard.get(struct.$value);

            if (!ref) {
                return false;
            }

            return Guard.Validator.validate(obj, ref);
        }
    };
}

export { Guard };
