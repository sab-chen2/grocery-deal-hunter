
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";
import { createSession } from "./create-session";
import { findSessionByToken } from "./find-session";
import { hashPassword } from "./password";

describe("findSessionByToken database integration", () => {
  it("finds a valid session using its original token", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const session = await createSession(userId);
      sessionId = session.sessionId;

      const result = await findSessionByToken(session.token);

      expect(result).toEqual({
        sessionId,
        userId,
      });
    } finally {
      if (sessionId !== undefined) {
        await db.orm.public.Session
          .where({ sessionId })
          .delete();
      }

      if (userId !== undefined) {
        await db.orm.public.User
          .where({ userId })
          .delete();
      }
    }
  });

  it("rejects an invalid session token", async () => {
    const invalidToken = randomUUID();

    const result = await findSessionByToken(invalidToken);

    expect(result).toBeNull();
  });

  it("rejects an expired session", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const session = await createSession(userId);
      sessionId = session.sessionId;

      // Change the expiration to a time in the past.
      await db.orm.public.Session
        .where({ sessionId })
        .update({
          expiresAt: new Date(
            Date.now() - 60_000
          ).toISOString(),
        });

      const result = await findSessionByToken(session.token);

      expect(result).toBeNull();
    } finally {
      if (sessionId !== undefined) {
        await db.orm.public.Session
          .where({ sessionId })
          .delete();
      }

      if (userId !== undefined) {
        await db.orm.public.User
          .where({ userId })
          .delete();
      }
    }
  });
});

