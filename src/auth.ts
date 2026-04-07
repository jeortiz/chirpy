import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { CustomError, UnauthorizedError } from "./utils/errors.js";
import { Request } from "express";
import { randomBytes } from "node:crypto";
import { db } from "./db/index.js";
import { refreshToken, refreshTokens } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { config } from "./config.js";


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

export async function makeRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(256).toString('hex');
    const timestamp = Date.now() + (3600*24*30);

    const [result] = await db
        .insert(refreshTokens)
        .values({
            token, userId, expiresAt: new Date(timestamp)
        })
        .onConflictDoNothing()
        .returning();

    return result.token;
}

export async function refreshToken(token: string): Promise<string> {
    const [result] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.token, token));
    
    if (!result || result.revokedAt !== null) {
        throw new UnauthorizedError()
    }

    const expiryDate = result.expiresAt.getDate();
    if (expiryDate >= Date.now()) {
        throw new UnauthorizedError("Token has expired.")
    }

    const refreshedToken = makeJWT(result.userId, 3600*60, config.jwtSecret);
    
    return refreshedToken;
}

export async function revokeToken(token: string): Promise<void> {
    const [result] = await db
        .update(refreshTokens)
        .set({revokedAt: new Date()})
        .where(eq(refreshTokens.token, token))
        .returning();
    
    if (!result) {
        throw new UnauthorizedError()
    }

    return;
}