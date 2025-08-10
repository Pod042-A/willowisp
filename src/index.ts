type JSONValue = JSONObject | JSONArray | number | string | boolean | null;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

type Primitive = "number" | "string" | "boolean" | "null";
type Structure = {
    [key: string]: Primitive | Structure;
};
type StructureOf<T> = {
    [K in keyof T]: T[K] extends number
        ? "number"
        : T[K] extends string
          ? "string"
          : T[K] extends boolean
            ? "boolean"
            : T[K] extends null
              ? "null"
              : T[K] extends object
                ? StructureOf<T[K]>
                : never;
};

class Guard {
    private static _register: Map<symbol, Structure> = new Map();

    private constructor() {}

    public static set<T>(name: string, struct: StructureOf<T>): symbol {
        const symbol = Symbol(name);
        Guard._register.set(symbol, struct as Structure);
        return symbol;
    }

    public static get(symbol: symbol): Structure | undefined {
        return Guard._register.get(symbol);
    }

    public static assert<T>(obj: unknown, symbol: symbol): obj is T {
        const struct = Guard.get(symbol);
        if (!struct) {
            throw new Error(`Structure not found using symbol "${symbol.description ?? "unknown"}"`);
        }
        return Guard.#validate(obj, struct);
    }

    static #validate(obj: unknown, struct: Structure): boolean {
        if (!Guard.#isObject(obj)) {
            return false;
        }

        for (const key in struct) {
            if (Object.hasOwn(struct, key)) {
                const expected = struct[key];
                const actual = (obj as Record<string, unknown>)[key];

                if (typeof expected === "string" && !Guard.#isPrimitive(actual, expected)) {
                    return false;
                }
                if (typeof expected === "object" && !Guard.#validate(actual, expected)) {
                    return false;
                }
            }
        }
        return true;
    }

    static #isObject(obj: unknown): obj is object {
        return obj !== null && typeof obj === "object";
    }

    static #isPrimitive(value: unknown, expected: Primitive): boolean {
        switch (expected) {
            case "number":
                return typeof value === "number";
            case "string":
                return typeof value === "string";
            case "boolean":
                return typeof value === "boolean";
            case "null":
                return value === null;
            default:
                return false;
        }
    }
}

export { Guard, type StructureOf };
