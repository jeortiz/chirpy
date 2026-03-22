import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { CustomError, UnauthorizedError } from "./utils/errors.js";
import { Request } from "express";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

export function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    return argon2.verify(hash, password);
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {

    const time = Math.floor(Date.now() / 1000);
    const payload: payload = {
        iss: 'chirpy',
        sub: userID,
        iat: time,
        exp: time + expiresIn,
    }

    return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const decoded = jwt.verify(tokenString, secret) as payload;

        if (!decoded.sub) {
            throw new CustomError("Something went wrong.")
        }

        return decoded.sub;
    } catch(err: any) {
        if  (err instanceof CustomError) {
            throw err;
        }

        throw new UnauthorizedError();
    }
}

export function getBearerToken(req: Request): string {
    const bearer = req.get("Authorization");

    if (!bearer) {
        throw new UnauthorizedError();
    }

    return bearer.split(' ')[1]; 
}