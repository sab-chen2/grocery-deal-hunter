
import { describe, it, expect } from "vitest";
import {
  generateSessionToken,
  hashSessionToken,
} from "./session-token";

describe("Session token utilities", () => {
  it("generates a 64-character hexadecimal token", () => {
    const token = generateSessionToken();

    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates different tokens on successive calls", () => {
    const first = generateSessionToken();
    const second = generateSessionToken();

    expect(first).not.toBe(second);
  });

  it("produces a consistent SHA-256 hash", () => {
    const token = generateSessionToken();

    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different hashes for different tokens", () => {
    const first = generateSessionToken();
    const second = generateSessionToken();

    expect(hashSessionToken(first)).not.toBe(hashSessionToken(second));
  });
});

