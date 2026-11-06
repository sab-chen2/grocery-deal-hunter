
import argon2 from "argon2";

/**
 * Hash a plaintext password before storing it.
 */
export async function hashPassword(
  password: string
): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

/**
 * Verify a plaintext password against a stored hash.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return argon2.verify(passwordHash, password);
}

