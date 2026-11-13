
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";
import { createSession } from "./create-session";
import { findSessionByToken } from "./find-session";
import { revokeSession } from "./revoke-session";
import { hashPassword } from "./password";

describe("revokeSession database integration", () => {
  it("revokes a session so its token can no longer authenticate", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const session = await createSession(userId);
      sessionId = session.sessionId;

      // Verify the session works before revocation.
      expect(await findSessionByToken(session.token)).toEqual({
        sessionId,
        userId,
      });

      await revokeSession(session.token);

      // The same token must no longer authenticate.
      expect(await findSessionByToken(session.token)).toBeNull();

      // Revoking an already-revoked session should be harmless.
      await expect(
        revokeSession(session.token)
      ).resolves.toBeUndefined();
    } finally {
      if (sessionId !== undefined) {
        const remainingSession = await db.orm.public.Session
          .where({ sessionId })
          .first();

        if (remainingSession) {
          await db.orm.public.Session
            .where({ sessionId })
            .delete();
        }
      }

      if (userId !== undefined) {
        await db.orm.public.User
          .where({ userId })
          .delete();
      }
    }
  });

  it("handles deleting a nonexistent session record", async () => {
    const nonexistentTokenHash = "0".repeat(64);

    await expect(
      db.orm.public.Session
        .where({ tokenHash: nonexistentTokenHash })
        .delete()
    ).resolves.not.toThrow();
  });

  it("handles concurrent revocation of the same session", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const session = await createSession(userId);
      sessionId = session.sessionId;

      await expect(
        Promise.all([
          revokeSession(session.token),
          revokeSession(session.token),
          revokeSession(session.token),
        ])
      ).resolves.toEqual([undefined, undefined, undefined]);

      expect(await findSessionByToken(session.token)).toBeNull();
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

