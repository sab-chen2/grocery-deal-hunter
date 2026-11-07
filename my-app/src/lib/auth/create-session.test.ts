
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";
import { createSession } from "./create-session";
import { hashSessionToken } from "./session-token";
import { hashPassword } from "./password";

describe("createSession database integration", () => {
  it("stores a hashed token with a seven-day expiration", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("SecurePassword123!");

    let userId: number | undefined;
    let sessionId: number | undefined;
    
    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      const beforeCreation = Date.now();
      const session = await createSession(userId);
      sessionId = session.sessionId;
      const afterCreation = Date.now();

      const storedSession = await db.orm.public.Session
        .where({ sessionId: session.sessionId })
        .first();

      expect(storedSession).not.toBeNull();

      expect(storedSession?.userId).toBe(userId);

      expect(storedSession?.tokenHash).toBe(
        hashSessionToken(session.token)
      );

      expect(storedSession?.tokenHash).not.toBe(session.token);

      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const expiration = new Date(session.expiresAt).getTime();

      expect(expiration).toBeGreaterThanOrEqual(
        beforeCreation + sevenDays
      );

      expect(expiration).toBeLessThanOrEqual(
        afterCreation + sevenDays
      );
    } 

      finally {
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

//    finally {
//      if (userId !== undefined) {
//        await db.orm.public.Session
//          .where({ userId })
//          .deleteMany();
//
//        await db.orm.public.User
//          .where({ userId })
//          .delete();
//      }
//    }

  });
});

