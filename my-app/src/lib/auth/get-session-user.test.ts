
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";
import { createSession } from "./create-session";
import { getSessionUser } from "./get-session-user";
import { hashPassword } from "./password";

describe("getSessionUser database integration", () => {
  it("retrieves the correct user from a valid session", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const session = await createSession(userId);
      sessionId = session.sessionId;

      const result = await getSessionUser(session.token);

      expect(result).toEqual({
        userId,
        email,
      });

      expect(result).not.toHaveProperty("passwordHash");
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

  it("returns null for an invalid session token", async () => {
    const result = await getSessionUser(
      `invalid-${randomUUID()}`
    );

    expect(result).toBeNull();
  });

  it("returns null for an expired session", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const session = await createSession(userId);
      sessionId = session.sessionId;

      await db.orm.public.Session
        .where({ sessionId })
        .update({
          expiresAt: new Date(
            Date.now() - 60_000
          ).toISOString(),
        });

      const result = await getSessionUser(session.token);

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

