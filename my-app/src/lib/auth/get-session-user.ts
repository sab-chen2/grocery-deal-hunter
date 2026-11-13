
import { db } from "../../prisma/db";
import { findSessionByToken } from "./find-session";

export async function getSessionUser(token: string) {
  const session = await findSessionByToken(token);

  if (!session) {
    return null;
  }

  const user = await db.orm.public.User
    .select("userId", "email")
    .where({ userId: session.userId })
    .first();

  if (!user) {
    return null;
  }

  return {
    userId: user.userId,
    email: user.email,
  };
}

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getSessionUser>>
>;

