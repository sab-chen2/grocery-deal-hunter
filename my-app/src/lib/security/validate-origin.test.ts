import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { validateOrigin } from "./validate-origin";

describe("validateOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts requests from the configured origin", () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "http://localhost:3000",
        },
      }
    );

    expect(validateOrigin(request)).toBe(true);
  });

  it("rejects requests from a different origin", () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "https://attacker.example",
        },
      }
    );

    expect(validateOrigin(request)).toBe(false);
  });

  it("rejects requests without an Origin header", () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
      }
    );

    expect(validateOrigin(request)).toBe(false);
  });

  it("rejects requests when APP_ORIGIN is missing", () => {
    vi.stubEnv("APP_ORIGIN", "");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "http://localhost:3000",
        },
      }
    );

    expect(validateOrigin(request)).toBe(false);
  });

  it("rejects malformed Origin headers", () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "not-a-valid-origin",
        },
      }
    );

    expect(validateOrigin(request)).toBe(false);
  });

  it("rejects origins containing paths", () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "http://localhost:3000/malicious",
        },
      }
    );

    expect(validateOrigin(request)).toBe(false);
  });

  it("rejects requests from a different port", () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "http://localhost:3001",
        },
      }
    );

    expect(validateOrigin(request)).toBe(false);
  });
});
