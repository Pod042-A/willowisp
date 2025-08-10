import { Guard, StructureOf } from "../src/index.js";

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

console.log("ValidUser:", Guard.assert(ValidUser, UserSymbol));
console.log("InvalidUser:", Guard.assert(InvalidUser, UserSymbol));
