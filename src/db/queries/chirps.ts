import { db } from "../index.js";
import { Chirp, chirps } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createChirp(chirp: Chirp): Promise<Chirp> {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
    
  return result;
}

export async function getAllChirps(): Promise<Array<Chirp>> {
  const result = await db
    .select()
    .from(chirps)
    .orderBy(chirps.createdAt);
    
  return result;
}

export async function getChirp(id: string): Promise<Chirp|undefined> {
  const [result] = await db
    .select()
    .from(chirps)
    .where(eq(chirps.id, id));
    
  return result;
}

