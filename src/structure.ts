enum StructureType {
    Primitive = "PRIMITIVE",
    Array = "ARRAY",
    Object = "OBJECT",
    Reference = "REFERENCE",
    Extend = "EXTEND",
}

type Primitive = "string" | "number" | "boolean" | "null";

interface Structure {
    $optional?: boolean;
    $relation: "AND" | "OR";
    $types: Array<
        PrimitiveStructure | ArrayStructure | ObjectStructure | ReferenceStructure | ExtendStructure
    >;
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
    $value: symbol;
}

interface ExtendStructure {
    $kind: "EXTEND";
    $value: symbol;
}

export {
    type Primitive,
    type Structure,
    type PrimitiveStructure,
    type ArrayStructure,
    type ObjectStructure,
    type ReferenceStructure,
    type ExtendStructure,
    StructureType,
};
