import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";

describe("createUser database integration", () => {
  it("creates a user and returns only safe fields", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = "test-hash-not-a-real-password";

    let userId: number | undefined;

    try {
      const user = await createUser(email, passwordHash);
      userId = user.userId;

      expect(user.userId).toBeGreaterThan(0);
      expect(user.email).toBe(email);
      expect(user).not.toHaveProperty("passwordHash");

      const savedUser = await db.orm.public.User
        .where({ userId })
        .first();

      expect(savedUser).not.toBeNull();
      expect(savedUser?.passwordHash).toBe(passwordHash);
    } finally {
      if (userId !== undefined) {
        await db.orm.public.User
          .where({ userId })
          .delete();
      }
    }
  });
  it("rejects duplicate email addresses", async () => {
    const email = `test-${randomUUID()}@example.com`;
    let userId: number | undefined;

    try {
      const firstUser = await createUser(email, "first-test-hash");
      userId = firstUser.userId;

//      await expect(
//        createUser(email, "second-test-hash")
//      ).rejects.toThrow();

await expect(
  createUser(email, "second-test-hash")
).rejects.toMatchObject({
  sqlState: "23505",
  constraint: "User_email_key",
});

      const users = await db.orm.public.User
        .where({ email })
        .all();

      expect(users).toHaveLength(1);
      expect(users[0].userId).toBe(userId);
    } finally {
      if (userId !== undefined) {
        await db.orm.public.User
          .where({ userId })
          .delete();
      }
    }
  });
});
