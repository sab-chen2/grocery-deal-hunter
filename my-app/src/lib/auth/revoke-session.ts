
import { db } from "../../prisma/db";
import { hashSessionToken } from "./session-token";

export async function revokeSession(
  token: string
): Promise<void> {
  const tokenHash = hashSessionToken(token);

  const session = await db.orm.public.Session
    .select("sessionId")
    .where({ tokenHash })
    .first();

  if (!session) {
    return;
  }

  await db.orm.public.Session
    .where({ sessionId: session.sessionId })
    .delete();
}

