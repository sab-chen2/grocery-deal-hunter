
import { createSession } from "@/src/lib/auth/create-session";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/src/lib/validation/login";
import { authenticateUser } from "@/src/lib/auth/authenticate-user";
import { checkRateLimit } from "@/src/lib/rate-limit/check-rate-limit";
import { getClientIdentifier } from "@/src/lib/rate-limit/client-identifier";
import { validateOrigin } from "@/src/lib/security/validate-origin";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden origin" },
      {
        status: 403,
        headers: NO_STORE_HEADERS,
      }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body" },
      {
        status: 400,
        headers: NO_STORE_HEADERS,
      }
    );
  }

  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid login data" },
      {
        status: 400,
        headers: NO_STORE_HEADERS,
      }
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
          ...NO_STORE_HEADERS,
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
      {
        status: 401,
        headers: NO_STORE_HEADERS,
      }
    );
  }

    const session = await createSession(user.userId);

    const response = NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      }
    );

    response.cookies.set("session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(session.expiresAt),
    });

    return response;

    } catch {
      return NextResponse.json(
        { error: "Authentication failed" },
        {
          status: 500,
          headers: NO_STORE_HEADERS,
        }
      );
    }
}

