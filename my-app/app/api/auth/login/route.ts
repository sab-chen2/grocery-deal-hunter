
import { createSession } from "@/src/lib/auth/create-session";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/src/lib/validation/login";
import { authenticateUser } from "@/src/lib/auth/authenticate-user";
import { checkRateLimit } from "@/src/lib/rate-limit/check-rate-limit";
import { getClientIdentifier } from "@/src/lib/rate-limit/client-identifier";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      { status: 400 }
    );
  }

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid login data" },
      { status: 400 }
    );
  }

try {
  const clientIdentifier = getClientIdentifier(request);

  const rateLimit = await checkRateLimit(
    "login",
    clientIdentifier
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  const user = await authenticateUser(
    result.data.email,
    result.data.password
  );

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

    const session = await createSession(user.userId);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 }
    );

    response.cookies.set("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expiresAt),
    });

    return response;

//  return NextResponse.json(
//    {
//      message: "Credentials verified successfully",
//      user,
//    },
//    { status: 200 }
//  );

} catch {
  return NextResponse.json(
    { error: "Authentication failed" },
    { status: 500 }
  );
}

//  return NextResponse.json(
//    {
//      message: "Login data is valid",
//      email: result.data.email,
//    },
//    { status: 200 }
//  );

}

