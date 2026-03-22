import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT } from "./auth";
import { UnauthorizedError } from "./utils/errors";

describe("JWT Validation", () => {
    const userId = "oneuserid";
    const secret = "correctPassword123!";
    const wrongSecret = "anotherPassword456!";
    const expiresIn = 10000;
    const expired = 0;

    let jwt1: string;
    let jwt2: string;

    beforeAll(async () => {
        jwt1 = makeJWT(userId, expiresIn, secret);
        jwt2 = makeJWT(userId, expired, secret);
    });

    it("should return user id for the correct secret", async () => {
        const result = validateJWT(jwt1, secret);
        expect(result).toBe(userId);
    });

    it("should throw error for wrong secret", async () => {
        expect(() => validateJWT(jwt1, wrongSecret)).toThrow(UnauthorizedError);
    });

    it("should throw error for expired token", async () => {
        expect(() => validateJWT(jwt2, secret)).toThrow(UnauthorizedError);
    });

});