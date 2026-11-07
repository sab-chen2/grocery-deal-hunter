
import { findUserByEmail } from "./find-user";
import { verifyPassword } from "./password";

// A valid Argon2id hash used when no account password hash exists.
const dummyHashPromise = import("./password").then(
  ({ hashPassword }) => hashPassword("dummy-password-for-timing")
);

export async function authenticateUser(
  email: string,
  password: string
) {
  const user = await findUserByEmail(email);

  const passwordHash =
    user?.passwordHash ?? (await dummyHashPromise);

  const passwordMatches = await verifyPassword(
    password,
    passwordHash
  );

  if (!user || !user.passwordHash || !passwordMatches) {
    return null;
  }

  return {
    userId: user.userId,
    email: user.email,
  };
}

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof authenticateUser>>
>;
;
