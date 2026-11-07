import { db } from "../../prisma/db";

export async function findUserByEmail(email: string) {
  return db.orm.public.User
    .select("userId", "email", "passwordHash")
    .where({ email })
    .first();
}

export type AuthUser = NonNullable<
  Awaited<ReturnType<typeof findUserByEmail>>
>;
