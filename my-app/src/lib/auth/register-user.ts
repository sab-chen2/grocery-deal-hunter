import { db } from "../../prisma/db";

export async function createUser(
  email: string,
  passwordHash: string
) {
  return db.orm.public.User
    .select("userId", "email")
    .create({
      email,
      passwordHash,
    });
}
export type CreatedUser = Awaited<ReturnType<typeof createUser>>;
