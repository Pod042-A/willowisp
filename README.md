# willowisp
> Runtime type validation and structure guard for JSON-compatible objects in TypeScript.

**Willowisp** is a lightweight and extensible runtime type validation system for TypeScript.  
It allows developers to define symbolic schemas for JSON-compatible types and safely assert unknown data at runtime with strong type narrowing.  
Built for use in data APIs, compilers, and any system requiring reliable structural integrity checks beyond static typing.

## Installation
```bash
npm install willowisp
```
## Import Package
```ts
import { Guard, Structure } from "willowisp";
```

## Nested Structures & Reference Types
This example demonstrates how to define and validate nested object structures with referenced types using `willowisp`.

### Defining a Substructure: `UserDetail`
```ts
type UserDetail = {
    address: string;
    job: string;
    salary?: number;
};
```
The corresponding structure uses `$optional: true` to mark optional fields, and `$additional: true` to allow unspecified properties in the object:
```ts
const UserDetailStructure = {
    $relation: "AND",
    $types: [
        {
            $additional: true,
            $kind: StructureType.Object,
            $value: {
                salary: {
                    $optional: true,
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "number" }],
                },
                ...
            },
        },
    ],
} satisfies Structure;
```
Use `Guard.set()` to register the structure and receive a unique key (`UserDetailStructureKey`) for referencing it later.
```ts
const UserDetailStructureKey = Guard.set("UserDetail", UserDetailStructure);
```

### Defining the Parent Structure: `User` with Reference
```ts
interface User {
    id: number;
    name: string;
    email?: string;
    roles: string[];
    profile: {
        active: boolean;
        status: number | string | boolean | null;
        tag: null;
    };
    detail: UserDetail;
}
```
In the `UserStructure`, the `detail` field references the previously registered `UserDetailStructureKey` via `$kind: Structure.Reference`:
```ts
const UserStructure = {
    $relation: "AND",
    $types: [
        {
            $kind: Structure.Object,
            $value: {
                detail: {
                    $relation: "AND",
                    $types: [{ $kind: Structure.Reference, $value: UserDetailStructureKey }],
                },
                ...
            },
        },
    ],
} satisfies Structure;
```
This allows large structures to be **modular**, **reusable**, and easily maintained by separating shared definitions.

### Registering & Validating Structures
All structures must be registered using `Guard.set(name, structure)` to be available for validation. You can use the registered key to perform runtime validation:
```ts
const input: unknown = { ... };

const UserStructureKey = Guard.set("User", UserStructure);

if (Guard.assert<User>(input, UserStructureKey)) {
    // `input` is now type-safe as `User`
}
```