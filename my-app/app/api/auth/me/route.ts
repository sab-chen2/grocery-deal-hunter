
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/src/lib/auth/get-session-user";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      {
        status: 401,
        headers: NO_STORE_HEADERS,
      }
    );
  }

  try {
    const user = await getSessionUser(token);

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        {
          status: 401,
          headers: NO_STORE_HEADERS,
        }
      );
    }

    return NextResponse.json(
      { user },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Unable to verify session" },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      }
    );
  }
}

