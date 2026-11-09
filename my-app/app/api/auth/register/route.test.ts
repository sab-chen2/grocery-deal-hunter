import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { checkRateLimit } from "@/src/lib/rate-limit/check-rate-limit";
import { hashPassword } from "@/src/lib/auth/password";
import { createUser } from "@/src/lib/auth/register-user";

vi.mock("@/src/lib/rate-limit/client-identifier", () => ({
  getClientIdentifier: vi.fn(() => "test-client"),
}));

vi.mock("@/src/lib/rate-limit/check-rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/src/lib/auth/password", () => ({
  hashPassword: vi.fn(),
}));

vi.mock("@/src/lib/auth/register-user", () => ({
  createUser: vi.fn(),
}));

describe("POST /api/auth/register", () => {
  it("returns 429 without hashing a password when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 120,
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      error: "Too many registration attempts. Please try again later.",
    });

    expect(checkRateLimit).toHaveBeenCalledWith(
      "register",
      "test-client"
    );
    expect(hashPassword).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns 500 without creating a user when rate limiting fails", async () => {
    vi.mocked(checkRateLimit).mockRejectedValueOnce(
      new Error("Database unavailable")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      error: "Registration failed",
    });

    expect(hashPassword).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("creates a user when the rate limit allows registration", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });

    vi.mocked(hashPassword).mockResolvedValueOnce("hashed-password");

    const mockUser = {
      userId: 123,
      email: "test@example.com",
    };

    vi.mocked(createUser).mockResolvedValueOnce(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      message: "User registered successfully",
      user: mockUser,
    });

    expect(checkRateLimit).toHaveBeenCalledWith(
      "register",
      "test-client"
    );

    expect(hashPassword).toHaveBeenCalledWith("TestPassword123!");

    expect(createUser).toHaveBeenCalledWith(
      "test@example.com",
      "hashed-password"
    );
  });

});
