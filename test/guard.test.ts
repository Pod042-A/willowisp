import { describe, it, expect } from "vitest";
import { Guard, Structure, StructureType } from "../src";

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
            $kind: StructureType.Object,
            $value: {
                address: {
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "string" }],
                },
                job: {
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "string" }],
                },
                salary: {
                    $optional: true,
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "number" }],
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
            $kind: StructureType.Object,
            $value: {
                id: {
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "number" }],
                },
                name: {
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "string" }],
                },
                email: {
                    $optional: true,
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Primitive, $value: "string" }],
                },
                roles: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: StructureType.Array,
                            $value: {
                                $relation: "AND",
                                $types: [
                                    {
                                        $kind: StructureType.Primitive,
                                        $value: "string",
                                    },
                                ],
                            },
                        },
                    ],
                },
                profile: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: StructureType.Object,
                            $value: {
                                active: {
                                    $relation: "AND",
                                    $types: [{ $kind: StructureType.Primitive, $value: "boolean" }],
                                },
                                status: {
                                    $relation: "OR",
                                    $types: [
                                        { $kind: StructureType.Primitive, $value: "string" },
                                        { $kind: StructureType.Primitive, $value: "number" },
                                        { $kind: StructureType.Primitive, $value: "boolean" },
                                        { $kind: StructureType.Primitive, $value: "null" },
                                    ],
                                },
                                tag: {
                                    $relation: "AND",
                                    $types: [{ $kind: StructureType.Primitive, $value: "null" }],
                                },
                            },
                        },
                    ],
                },
                detail: {
                    $relation: "AND",
                    $types: [{ $kind: StructureType.Reference, $value: UserDetailStructureKey }],
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
            $kind: StructureType.Array,
            $value: {
                $relation: "AND",
                $types: [{ $kind: StructureType.Reference, $value: UserStructureKey }],
            },
        },
    ],
} satisfies Structure;
const UsersStructureKey = Guard.set("Users", UsersStructure);

const dateValidator = <Date>(value: unknown): value is Date => {
    return value instanceof Date;
};
const DateValidatorKey = Guard.Extend.set("Date", dateValidator);
type Information = {
    createAt: Date;
    updatedAt: Date;
    expiredAt?: Date;
    message: string;
};
const InformationStructure = {
    $relation: "AND",
    $types: [
        {
            $additional: true,
            $kind: StructureType.Object,
            $value: {
                createdAt: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: StructureType.Extend,
                            $value: DateValidatorKey,
                        },
                    ],
                },
                updatedAt: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: StructureType.Extend,
                            $value: DateValidatorKey,
                        },
                    ],
                },
                expiredAt: {
                    $optional: true,
                    $relation: "AND",
                    $types: [
                        {
                            $kind: StructureType.Extend,
                            $value: DateValidatorKey,
                        },
                    ],
                },
                message: {
                    $relation: "AND",
                    $types: [
                        {
                            $kind: StructureType.Primitive,
                            $value: "string",
                        },
                    ],
                },
            },
        },
    ],
} satisfies Structure;
const InformationStructureKey = Guard.set("Information", InformationStructure);

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

describe("Extend", () => {
    it("Correct validator", () => {
        expect(Guard.Extend.get(DateValidatorKey)).toEqual(dateValidator);
    });

    it("Correct object pass validation of Extend structure", () => {
        const input: unknown = {
            createdAt: new Date(),
            updatedAt: new Date(),
            message: "message",
        };
        const result = Guard.assert<Information>(input, InformationStructureKey);
        console.log(result);
        expect(result).toBe(true);
    });
});
