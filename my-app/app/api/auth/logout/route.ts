
import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/src/lib/auth/revoke-session";
import { validateOrigin } from "@/src/lib/security/validate-origin";

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden origin" },
      { status: 403 }
    );
  }

  const token = request.cookies.get("session")?.value;

  try {
    if (token) {
      await revokeSession(token);
    }

    const response = NextResponse.json(
      { message: "Logout successful" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

