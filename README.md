# willowisp

> Runtime type validation and structure guard for JSON-compatible objects in TypeScript.

**Willowisp** is a lightweight and extensible runtime type validation system for TypeScript.  
It allows developers to define symbolic schemas for JSON-compatible types and safely assert unknown data at runtime with strong type narrowing.  
Built for use in data APIs, compilers, and any system requiring reliable structural integrity checks beyond static typing.

## Installation

```bash
npm install willowisp
```

## Example
```ts
import { Guard, StructureOf } from "willowisp";

type User = {
    name: string;
    id: number;
};

const UserStructure: StructureOf<User> = {
    name: "string",
    id: "number",
};

const UserSymbol = Guard.set("User", UserStructure);

const ValidUser = {
    name: "Valid",
    id: 1,
};

const InvalidUser = {
    name: undefined,
    id: 3.14,
};

console.log("ValidUser:", Guard.assert(ValidUser, UserSymbol));     // true
console.log("InvalidUser:", Guard.assert(InvalidUser, UserSymbol)); // false
```
