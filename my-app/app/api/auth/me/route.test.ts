import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { getSessionUser } from "@/src/lib/auth/get-session-user";

vi.mock("@/src/lib/auth/get-session-user", () => ({
  getSessionUser: vi.fn(),
}));

describe("GET /api/auth/me", () => {
  it("returns 401 without a session cookie", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/me"
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      error: "Not authenticated",
    });

    expect(getSessionUser).not.toHaveBeenCalled();
  });

  it("returns 401 for an invalid or expired session", async () => {
    vi.mocked(getSessionUser).mockResolvedValueOnce(null);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/me",
      {
        headers: {
          Cookie: "session=invalid-session-token",
        },
      }
    );

    const response = await GET(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      error: "Not authenticated",
    });

    expect(getSessionUser).toHaveBeenCalledWith(
      "invalid-session-token"
    );
  });

  it("returns the authenticated user for a valid session", async () => {
    const mockUser = {
      userId: 123,
      email: "test@example.com",
    };

    vi.mocked(getSessionUser).mockResolvedValueOnce(mockUser);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/me",
      {
        headers: {
          Cookie: "session=valid-session-token",
        },
      }
    );

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      user: mockUser,
    });

    expect(getSessionUser).toHaveBeenCalledWith(
      "valid-session-token"
    );
  });

  it("returns 500 when session verification fails", async () => {
    vi.mocked(getSessionUser).mockRejectedValueOnce(
      new Error("Database unavailable")
    );

    const request = new NextRequest(
      "http://localhost:3000/api/auth/me",
      {
        headers: {
          Cookie: "session=valid-session-token",
        },
      }
    );

    const response = await GET(request);

    expect(response.status).toBe(500);
    expect(response.headers.get("Cache-Control")).toBe("no-store");

    expect(await response.json()).toEqual({
      error: "Unable to verify session",
    });

    expect(getSessionUser).toHaveBeenCalledWith(
      "valid-session-token"
    );
  });
});
