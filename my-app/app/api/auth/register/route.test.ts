import { beforeEach, describe, it, expect, vi } from "vitest";
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
  beforeEach(() => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");
    vi.clearAllMocks();
  });

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
    expect(response.headers.get("Cache-Control")).toBe("no-store");
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
    expect(response.headers.get("Cache-Control")).toBe("no-store");
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
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      message:
        "Registration request processed. If eligible, an account may have been created.",
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

  it("rejects cross-origin registration before creating a user", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
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
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({
      error: "Forbidden origin",
    });

    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();

    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("returns 400 for malformed JSON", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: '{"email":',
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      error: "Invalid JSON request body",
    });

    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid registration data", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "not-an-email",
          password: "TestPassword123!",
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const body = await response.json();

    expect(body.error).toBe("Invalid registration data");
    expect(body.details).toBeDefined();

    expect(checkRateLimit).not.toHaveBeenCalled();
    expect(hashPassword).not.toHaveBeenCalled();
    expect(createUser).not.toHaveBeenCalled();
  });

  it("returns a generic response when the email address is already registered", async () => {
    vi.mocked(checkRateLimit).mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });

    vi.mocked(hashPassword).mockResolvedValueOnce("hashed-password");

    vi.mocked(createUser).mockRejectedValueOnce({
      kind: "sql_query",
      sqlState: "23505",
      constraint: "User_email_key",
    });

    const request = new NextRequest(
      "http://localhost:3000/api/auth/register",
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
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      message:
        "Registration request processed. If eligible, an account may have been created.",
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

  it("does not reveal whether an email address is already registered", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });

    vi.mocked(hashPassword).mockResolvedValue("hashed-password");

    vi.mocked(createUser)
      .mockResolvedValueOnce({
        userId: 123,
        email: "test@example.com",
      })
      .mockRejectedValueOnce({
        kind: "sql_query",
        sqlState: "23505",
        constraint: "User_email_key",
      });

    const makeRequest = () =>
      new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "TestPassword123!",
        }),
      });

    const successResponse = await POST(makeRequest());
    const duplicateResponse = await POST(makeRequest());

    expect(successResponse.status).toBe(200);
    expect(duplicateResponse.status).toBe(successResponse.status);

    expect(duplicateResponse.headers.get("Cache-Control")).toBe(
      successResponse.headers.get("Cache-Control")
    );

    expect(await duplicateResponse.json()).toEqual(
      await successResponse.json()
    );

    expect(createUser).toHaveBeenCalledTimes(2);
  });
});
