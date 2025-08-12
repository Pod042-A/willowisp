import { describe, it, expect } from "vitest";
import { Guard, Structure } from "../src";

type UserDetail = {
    address: string;
    job: string;
    salary?: number;
};
const UserDetailStructure = {
    $relation: "AND",
    $types: [
        {
            $additional: true,
            $kind: "OBJECT",
            $value: {
                address: {
                    $relation: "AND",
                    $types: [{ $kind: "PRIMITIVE", $value: "string" }],
                },
                job: {
                    $relation: "AND",
                    $types: [{ $kind: "PRIMITIVE", $value: "string" }],
                },
                salary: {
                    $optional: true,
                    $relation: "AND",
                    $types: [{ $kind: "PRIMITIVE", $value: "number" }],
                },
            },
        },
    ],
} satisfies Structure;
const UserDetailStructureKey = Guard.set("UserDetail", UserDetailStructure);

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
                detail: {
                    $relation: "AND",
                    $types: [{ $kind: "REFERENCE", $value: UserDetailStructureKey }],
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

    it("Correct structure initialed from Array structure", () => {
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
            detail: {
                address: "Detroit",
                job: "Android",
            },
        };
        const result = Guard.assert<User>(input, UserStructureKey);
        console.log(result);
        expect(result).toBe(true);
    });

    it("Incorrect object fail validation of Object structure with missing attribute without Optional value", () => {
        const input: unknown = {
            name: "Alice",
            roles: ["user", "vip"],
            profile: {
                active: true,
                status: "1",
                tag: null,
            },
        };
        const result = Guard.assert<User>(input, UserStructureKey);
        console.log(result);
        expect(result).toBe(false);
    });

    it("Incorrect object fail validation of Object structure with additional attribute without Additional value", () => {
        const input: unknown = {
            id: 1,
            name: "Alice",
            roles: ["user", "vip"],
            profile: {
                active: true,
                status: "1",
                tag: null,
            },
            detail: {
                address: "Detroit",
                job: "Android",
            },
            age: 10,
        };
        const result = Guard.assert<User>(input, UserStructureKey);
        console.log(result);
        expect(result).toBe(false);
    });

    it("Correct object pass validation of Object structure with additional attribute and Additional value", () => {
        const input: unknown = {
            id: 1,
            name: "Alice",
            roles: ["user", "vip"],
            profile: {
                active: true,
                status: "1",
                tag: null,
            },
            detail: {
                address: "Detroit",
                job: "Android",
                salary: 0,
                age: 10,
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
            detail: {
                address: "Detroit",
                job: "Android",
                salary: 0,
            },
        };
        expect(Guard.assert<User>(input, UserStructure)).toBe(true);
    });

    it("Correct object pass validation of Array structure", () => {
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
                detail: {
                    address: "Detroit",
                    job: "Android",
                    salary: 0,
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
                detail: {
                    address: "Detroit",
                    job: "Android",
                    salary: 0,
                },
            },
        ];
        expect(Guard.assert<Users>(input, UsersStructureKey)).toBe(true);
    });
});
