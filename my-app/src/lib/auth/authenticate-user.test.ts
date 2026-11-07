
import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db";
import { createUser } from "./register-user";
import { authenticateUser } from "./authenticate-user";
import { hashPassword } from "./password";

describe("authenticateUser database integration", () => {
  it("authenticates a user with the correct password", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const password = "SecurePassword123!";
    const passwordHash = await hashPassword(password);
    let userId: number | undefined;

    try {
      const createdUser = await createUser(email, passwordHash);
      userId = createdUser.userId;

      const authenticatedUser = await authenticateUser(email, password);

      expect(authenticatedUser).toEqual({
        userId,
        email,
      });
      expect(authenticatedUser).not.toHaveProperty("passwordHash");
    } finally {
      if (userId !== undefined) {
        await db.orm.public.User.where({ userId }).delete();
      }
    }
  });

  it("rejects an incorrect password", async () => {
    const email = `test-${randomUUID()}@example.com`;
    const passwordHash = await hashPassword("CorrectPassword123!");
    let userId: number | undefined;

    try {
      const createdUser = await createUser(email, passwordHash);
      userId = createdUser.userId;

      const result = await authenticateUser(
        email,
        "IncorrectPassword123!"
      );

      expect(result).toBeNull();
    } finally {
      if (userId !== undefined) {
        await db.orm.public.User.where({ userId }).delete();
      }
    }
  });

  it("rejects an email address that does not exist", async () => {
    const email = `missing-${randomUUID()}@example.com`;

    const result = await authenticateUser(
      email,
      "SecurePassword123!"
    );

    expect(result).toBeNull();
  });
});

