
import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("Password hashing", () => {
  const password = "MySecurePassword123!";

  it("generates an Argon2id hash", async () => {
    const hash = await hashPassword(password);

    expect(hash.startsWith("$argon2id$")).toBe(true);
    expect(hash).not.toBe(password);
  });

  it("verifies a correct password", async () => {
    const hash = await hashPassword(password);

    expect(await verifyPassword(password, hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword(password);

    expect(await verifyPassword("WrongPassword123!", hash)).toBe(false);
  });

  it("generates different hashes for identical passwords", async () => {
    const firstHash = await hashPassword(password);
    const secondHash = await hashPassword(password);

    expect(firstHash).not.toBe(secondHash);

    expect(await verifyPassword(password, firstHash)).toBe(true);
    expect(await verifyPassword(password, secondHash)).toBe(true);
  });
});

