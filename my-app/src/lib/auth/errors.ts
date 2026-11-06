export function isDuplicateEmailError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("sqlState" in error) || !("constraint" in error)) {
    return false;
  }

  return (
    error.sqlState === "23505" &&
    error.constraint === "User_email_key"
  );
}
