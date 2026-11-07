
import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/src/lib/auth/revoke-session";

export async function POST(request: NextRequest) {
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

