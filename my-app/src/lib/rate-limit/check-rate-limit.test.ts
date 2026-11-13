import "dotenv/config";
import { createHmac, randomUUID } from "node:crypto";
import { rateLimitDb } from "./db";
import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./check-rate-limit";

describe("checkRateLimit", () => {
  it("allows five login attempts and blocks the sixth", async () => {
    const identifier = `test:${randomUUID()}`;

    for (let attempt = 1; attempt <= 5; attempt++) {
      const result = await checkRateLimit("login", identifier);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(5 - attempt);
      expect(result.retryAfterSeconds).toBe(0);
    }

    const blocked = await checkRateLimit("login", identifier);

    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });
  it("handles concurrent login attempts atomically", async () => {
    const identifier = `concurrent-test:${randomUUID()}`;

    const results = await Promise.all(
      Array.from({ length: 20 }, () =>
        checkRateLimit("login", identifier),
      ),
    );

    const allowed = results.filter((result) => result.allowed);
    const blocked = results.filter((result) => !result.allowed);

    expect(allowed).toHaveLength(5);
    expect(blocked).toHaveLength(15);

    const finalResult = await checkRateLimit("login", identifier);

    expect(finalResult.allowed).toBe(false);
    expect(finalResult.remaining).toBe(0);
  });
  it("resets the counter when the time window expires", async () => {
    const identifier = `expiration-test:${randomUUID()}`;

    // Create the initial rate-limit record.
    const first = await checkRateLimit("login", identifier);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(4);

    // Calculate the same hash used by checkRateLimit.
    const keyHash = createHmac(
      "sha256",
      process.env.RATE_LIMIT_SECRET!,
    )
      .update(identifier)
      .digest("hex");

    // Simulate an expired time window.
    await rateLimitDb`
      UPDATE "RateLimit"
      SET "expiresAt" = NOW() - INTERVAL '1 second'
      WHERE "keyHash" = ${keyHash}
        AND "policy" = 'login'
    `;

    // The next attempt should start a fresh window.
    const result = await checkRateLimit("login", identifier);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.retryAfterSeconds).toBe(0);
  });
});
