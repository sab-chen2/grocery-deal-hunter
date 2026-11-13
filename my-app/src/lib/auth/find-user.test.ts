import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";
import { findUserByEmail } from "./find-user";

describe("findUserByEmail database integration", () => {
  it("retrieves an existing user and their password hash", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = "test-hash";
    let userId: number | undefined;

    try {
      const createdUser = await createUser(email, passwordHash);
      userId = createdUser.userId;

      const foundUser = await findUserByEmail(email);

      expect(foundUser).not.toBeNull();
      expect(foundUser?.userId).toBe(userId);
      expect(foundUser?.email).toBe(email);
      expect(foundUser?.passwordHash).toBe(passwordHash);
    } finally {
      if (userId !== undefined) {
        await db.orm.public.User.where({ userId }).delete();
      }
    }
  });

  it("returns null when the email does not exist", async () => {
    const email = `missing-${randomUUID()}@example.com`;

    const foundUser = await findUserByEmail(email);

    expect(foundUser).toBeNull();
  });
});
