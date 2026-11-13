export const RATE_LIMIT_POLICIES = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  register: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

export type RateLimitPolicy = keyof typeof RATE_LIMIT_POLICIES;
