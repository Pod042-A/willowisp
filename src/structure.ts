type Primitive = "string" | "number" | "boolean" | "null";

interface Structure {
    $optional?: boolean;
    $relation: "AND" | "OR";
    $types: Array<PrimitiveStructure | ArrayStructure | ObjectStructure | ReferenceStructure>;
}

interface PrimitiveStructure {
    $kind: "PRIMITIVE";
    $value: Primitive;
}

interface ArrayStructure {
    $kind: "ARRAY";
    $value: Structure;
}

interface ObjectStructure {
    $kind: "OBJECT";
    $value: Record<string, Structure>;
    $additional?: boolean;
}

interface ReferenceStructure {
    $kind: "REFERENCE";
    $value: string;
}

export type { Primitive, Structure, PrimitiveStructure, ArrayStructure, ObjectStructure, ReferenceStructure };
