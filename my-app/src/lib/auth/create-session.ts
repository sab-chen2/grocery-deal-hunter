
import { db } from "../../prisma/db";
import {
  generateSessionToken,
  hashSessionToken,
} from "./session-token";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(userId: number) {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_MS
  ).toISOString();

  const session = await db.orm.public.Session
    .select("sessionId", "expiresAt")
    .create({
      userId,
      tokenHash,
      expiresAt,
    });

  return {
    token,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
  };
}

export type CreatedSession = Awaited<
  ReturnType<typeof createSession>
>;

