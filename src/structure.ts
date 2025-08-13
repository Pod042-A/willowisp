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
    $kind: StructureType.Primitive;
    $value: Primitive;
}

interface ArrayStructure {
    $kind: StructureType.Array;
    $value: Structure;
}

interface ObjectStructure {
    $kind: StructureType.Object;
    $value: Record<string, Structure>;
    $additional?: boolean;
}

interface ReferenceStructure {
    $kind: StructureType.Reference;
    $value: symbol;
}

interface ExtendStructure {
    $kind: StructureType.Extend;
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
