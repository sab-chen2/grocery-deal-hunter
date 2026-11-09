import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/src/lib/validation/register";
import { hashPassword } from "@/src/lib/auth/password";
import { createUser } from "@/src/lib/auth/register-user";
import { isDuplicateEmailError } from "@/src/lib/auth/errors";
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

  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid registration data",
        details: result.error.flatten(),
      },
      {
        status: 400,
        headers: NO_STORE_HEADERS,
      }
    );
  }

  try {
    const clientIdentifier = getClientIdentifier(request);

    const rateLimit = await checkRateLimit(
      "register",
      clientIdentifier
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many registration attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const passwordHash = await hashPassword(result.data.password);

    const user = await createUser(result.data.email, passwordHash);
    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
      },
      {
        status: 201,
        headers: NO_STORE_HEADERS,
      }
    );
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return NextResponse.json(
        { error: "Email address is already registered" },
        {
          status: 409,
          headers: NO_STORE_HEADERS,
        }
      );
    }

    return NextResponse.json(
      { error: "Registration failed" },
      {
        status: 500,
        headers: NO_STORE_HEADERS,
      }
    );
  }
}
