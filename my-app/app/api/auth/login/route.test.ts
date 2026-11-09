import { beforeEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { checkRateLimit } from "@/src/lib/rate-limit/check-rate-limit";
import { authenticateUser } from "@/src/lib/auth/authenticate-user";
import { createSession } from "@/src/lib/auth/create-session";

vi.mock("@/src/lib/rate-limit/client-identifier", () => ({
  getClientIdentifier: vi.fn(() => "test-client"),
}));

vi.mock("@/src/lib/rate-limit/check-rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/src/lib/auth/authenticate-user", () => ({
  authenticateUser: vi.fn(),
}));

vi.mock("@/src/lib/auth/create-session", () => ({
  createSession: vi.fn(),
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");
    vi.clearAllMocks();
  });

  it("returns 429 without authenticating when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 120,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("120");

    expect(await response.json()).toEqual({
      error: "Too many login attempts. Please try again later.",
    });

    expect(checkRateLimit).toHaveBeenCalledWith(
      "login",
      "test-client"
    );

    expect(authenticateUser).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it("returns 500 without authenticating when rate limiting fails", async () => {
    vi.mocked(checkRateLimit).mockRejectedValueOnce(
      new Error("Database unavailable")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(500);

    expect(await response.json()).toEqual({
      error: "Authentication failed",
    });

    expect(authenticateUser).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid credentials when rate limiting allows login", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });

    vi.mocked(authenticateUser).mockResolvedValueOnce(null);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "IncorrectPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(401);

    expect(await response.json()).toEqual({
      error: "Invalid email or password",
    });

    expect(checkRateLimit).toHaveBeenCalledWith(
      "login",
      "test-client"
    );

    expect(authenticateUser).toHaveBeenCalledWith(
      "test@example.com",
      "IncorrectPassword123!"
    );

    expect(createSession).not.toHaveBeenCalled();
  });

  it("creates a session and sets a cookie after successful login", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });

    const mockUser = {
      userId: 123,
      email: "test@example.com",
    };

    vi.mocked(authenticateUser).mockResolvedValueOnce(mockUser);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    vi.mocked(createSession).mockResolvedValueOnce({
      token: "mock-session-token",
      sessionId: 456,
      expiresAt,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(200);

    expect(await response.json()).toEqual({
      message: "Login successful",
      user: mockUser,
    });

    expect(authenticateUser).toHaveBeenCalledWith(
      "test@example.com",
      "TestPassword123!"
    );

    expect(createSession).toHaveBeenCalledWith(123);

    const cookie = response.cookies.get("session");

    expect(cookie?.value).toBe("mock-session-token");

    const setCookieHeader = response.headers.get("set-cookie");

    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=lax");
    expect(setCookieHeader).toContain("Path=/");
  });

  it("rejects cross-origin login requests before authentication", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://attacker.example",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(403);

    expect(await response.json()).toEqual({
      error: "Forbidden origin",
    });

    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(authenticateUser).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();

    expect(response.headers.get("set-cookie")).toBeNull();
  });
});
