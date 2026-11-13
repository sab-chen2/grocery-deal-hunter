
import { db } from "../../prisma/db";
import { hashSessionToken } from "./session-token";

export async function findSessionByToken(token: string) {
  const tokenHash = hashSessionToken(token);

  const session = await db.orm.public.Session
    .select("sessionId", "userId", "expiresAt")
    .where({ tokenHash })
    .first();

  if (!session || session.userId === null) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  return {
    sessionId: session.sessionId,
    userId: session.userId,
  };
}

export type ValidSession = NonNullable<
  Awaited<ReturnType<typeof findSessionByToken>>
>;

