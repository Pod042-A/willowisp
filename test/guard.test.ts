import { describe, it, expect } from "vitest";
import { Guard, Structure } from "../src";

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
}
const UserStructure = {
    $relation: "AND",
    $types: [
        {
            $kind: "OBJECT",
            $value: {
                id: {
                    $relation: "AND",
                    $types: [{ $kind: "PRIMITIVE", $value: "number" }],
                },
                name: {
                    $relation: "AND",
                    $types: [{ $kind: "PRIMITIVE", $value: "string" }],
                },
                email: {
                    $optional: true,
                    $relation: "AND",
                    $types: [{ $kind: "PRIMITIVE", $value: "string" }],
                },
                roles: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: "ARRAY",
                            $value: { $relation: "AND", $types: [{ $kind: "PRIMITIVE", $value: "string" }] },
                        },
                    ],
                },
                profile: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: "OBJECT",
                            $value: {
                                active: {
                                    $relation: "AND",
                                    $types: [{ $kind: "PRIMITIVE", $value: "boolean" }],
                                },
                                status: {
                                    $relation: "OR",
                                    $types: [
                                        { $kind: "PRIMITIVE", $value: "string" },
                                        { $kind: "PRIMITIVE", $value: "number" },
                                        { $kind: "PRIMITIVE", $value: "boolean" },
                                        { $kind: "PRIMITIVE", $value: "null" },
                                    ],
                                },
                                tag: {
                                    $relation: "AND",
                                    $types: [{ $kind: "PRIMITIVE", $value: "null" }],
                                },
                            },
                        },
                    ],
                },
            },
        },
    ],
} satisfies Structure;
const UserStructureKey = Guard.set("User", UserStructure);

type Users = User[];
const UsersStructure = {
    $relation: "AND",
    $types: [
        {
            $kind: "ARRAY",
            $value: { $relation: "AND", $types: [{ $kind: "REFERENCE", $value: UserStructureKey }] },
        },
    ],
} satisfies Structure;
const UsersStructureKey = Guard.set("Users", UsersStructure);

describe("Guard", () => {
    it("Correct structure initialed from Object structure", () => {
        expect(Guard.get(UserStructureKey)).toEqual(UserStructure);
    });

    it("Correct structure initialed from Array structure & Reference structure", () => {
        expect(Guard.get(UsersStructureKey)).toEqual(UsersStructure);
    });

    it("Correct object pass validation of Object structure (without optional attributes & use key)", () => {
        const input: unknown = {
            id: 1,
            name: "Alice",
            roles: ["user", "vip"],
            profile: {
                active: true,
                status: "1",
                tag: null,
            },
        };
        expect(Guard.assert<User>(input, UserStructureKey)).toBe(true);
    });

    it("Correct object pass validation of Object structure (with optional attributes & use structure instance)", () => {
        const input: unknown = {
            id: 1,
            name: "Alice",
            email: "alice@example.com",
            roles: ["user", "vip"],
            profile: {
                active: true,
                status: "1",
                tag: null,
            },
        };
        expect(Guard.assert<User>(input, UserStructure)).toBe(true);
    });

    it("Correct object pass validation of Array structure and Reference structure", () => {
        const input: unknown[] = [
            {
                id: 1,
                name: "Alice",
                email: "alice@example.com",
                roles: ["user", "vip"],
                profile: {
                    active: true,
                    status: "1",
                    tag: null,
                },
            },
            {
                id: 2,
                name: "Kara",
                roles: ["user"],
                profile: {
                    active: false,
                    status: 0,
                    tag: null,
                },
            },
        ];
        expect(Guard.assert<Users>(input, UsersStructureKey)).toBe(true);
    });
});
