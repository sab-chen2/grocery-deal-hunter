import "server-only";

import { createHmac } from "node:crypto";
import { rateLimitDb } from "./db";
import {
  RATE_LIMIT_POLICIES,
  type RateLimitPolicy,
} from "./policies";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function checkRateLimit(
  policy: RateLimitPolicy,
  identifier: string,
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_POLICIES[policy];

  const secret = process.env.RATE_LIMIT_SECRET;

  if (!secret) {
    throw new Error("RATE_LIMIT_SECRET is not configured");
  }

  const keyHash = createHmac("sha256", secret)
    .update(identifier)
    .digest("hex");

  const windowSeconds = Math.ceil(config.windowMs / 1000);

  const rows = await rateLimitDb<{
    attempts: number;
    expiresAt: Date;
  }[]>`
    INSERT INTO "RateLimit" (
      "keyHash",
      "policy",
      "attempts",
      "windowStart",
      "expiresAt"
    )
    VALUES (
      ${keyHash},
      ${policy},
      1,
      NOW(),
      NOW() + ${windowSeconds} * INTERVAL '1 second'
    )
    ON CONFLICT ("keyHash", "policy")
    DO UPDATE SET
      "attempts" = CASE
        WHEN "RateLimit"."expiresAt" <= NOW()
          THEN 1
        ELSE "RateLimit"."attempts" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimit"."expiresAt" <= NOW()
          THEN NOW()
        ELSE "RateLimit"."windowStart"
      END,
      "expiresAt" = CASE
        WHEN "RateLimit"."expiresAt" <= NOW()
          THEN NOW() + ${windowSeconds} * INTERVAL '1 second'
        ELSE "RateLimit"."expiresAt"
      END
    RETURNING "attempts", "expiresAt";
  `;

  const result = rows[0];

  if (!result) {
    throw new Error("Rate-limit counter update returned no row");
  }

  const allowed = result.attempts <= config.maxAttempts;

  return {
    allowed,
    remaining: Math.max(0, config.maxAttempts - result.attempts),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(
          0,
          Math.ceil(
            (result.expiresAt.getTime() - Date.now()) / 1000,
          ),
        ),
  };
}
