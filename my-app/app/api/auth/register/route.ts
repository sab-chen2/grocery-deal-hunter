import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/src/lib/validation/register";
import { hashPassword } from "@/src/lib/auth/password";
import { createUser } from "@/src/lib/auth/register-user";
import { isDuplicateEmailError } from "@/src/lib/auth/errors";

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

  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid registration data",
        details: result.error.flatten(),
      },
      { status: 400 }
    );
  }

const passwordHash = await hashPassword(result.data.password);

try {
  const user = await createUser(result.data.email, passwordHash);

  return NextResponse.json(
    {
      message: "User registered successfully",
      user,
    },
    { status: 201 }
  );
} catch (error) {
  if (isDuplicateEmailError(error)) {
    return NextResponse.json(
      { error: "Email address is already registered" },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: "Registration failed" },
    { status: 500 }
  );
}

///return NextResponse.json(
///  {
///    message: "Registration data validated and password hashed",
///    email: result.data.email,
///    passwordHashed: passwordHash.startsWith("$argon2id$"),
///  },
///  { status: 200 }
///);

//  return NextResponse.json(
//    {
//      message: "Registration data is valid",
//      email: result.data.email,
//    },
//    { status: 200 }
//  );
}
