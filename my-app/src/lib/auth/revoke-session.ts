
import { db } from "../../prisma/db";
import { hashSessionToken } from "./session-token";

export async function revokeSession(
  token: string
): Promise<void> {
  const tokenHash = hashSessionToken(token);

  await db.orm.public.Session
    .where({ tokenHash })
    .delete();
}

