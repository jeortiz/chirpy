import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export type PublicUser = Omit<NewUser, "hashedPassword">;

export async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
  return;
}

export async function getUserBy(email: string): Promise<NewUser> {
  const [result] = await db.select().from(users).where(eq(users.email, email));

  return result;
}

export async function updateUser(userId: string, email: string, password: string): Promise<PublicUser> {
  const [result] = await db
    .update(users)
    .set({email: email, hashedPassword: password})
    .where(eq(users.id, userId))
    .returning();
    
  const user = result as PublicUser;
  console.log(user);
  return user;
}

export async function upgrateUserToRed(userId: string): Promise<PublicUser> {
  const [result] = await db
    .update(users)
    .set({isChirpyRed: true})
    .where(eq(users.id, userId))
    .returning();
    
  const user = result as PublicUser;
  console.log(user);
  return user;
}