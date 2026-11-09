import { afterEach, describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";
import { revokeSession } from "@/src/lib/auth/revoke-session";

vi.mock("@/src/lib/auth/revoke-session", () => ({
  revokeSession: vi.fn(),
}));

describe("POST /api/auth/logout", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("rejects cross-origin requests without revoking the session", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "https://attacker.example",
          Cookie: "session=test-session-token",
        },
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(403);

    expect(await response.json()).toEqual({
      error: "Forbidden origin",
    });

    expect(revokeSession).not.toHaveBeenCalled();

    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("revokes the session and clears the cookie for same-origin requests", async () => {
    vi.stubEnv("APP_ORIGIN", "http://localhost:3000");

    vi.mocked(revokeSession).mockResolvedValueOnce(undefined);

    const request = new NextRequest(
      "http://localhost:3000/api/auth/logout",
      {
        method: "POST",
        headers: {
          Origin: "http://localhost:3000",
          Cookie: "session=test-session-token",
        },
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(200);

    expect(await response.json()).toEqual({
      message: "Logout successful",
    });

    expect(revokeSession).toHaveBeenCalledWith(
      "test-session-token"
    );

    expect(response.headers.get("Cache-Control")).toBe("no-store");

    const cookie = response.cookies.get("session");

    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);

    const setCookieHeader = response.headers.get("set-cookie");

    expect(setCookieHeader).toContain("HttpOnly");
    expect(setCookieHeader).toContain("SameSite=lax");
    expect(setCookieHeader).toContain("Path=/");
  });
});
