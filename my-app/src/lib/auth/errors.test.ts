import { describe, it, expect } from "vitest";
import { isDuplicateEmailError } from "./errors";

describe("isDuplicateEmailError", () => {
  it("recognizes a duplicate email constraint violation", () => {
    const error = {
      kind: "sql_query",
      sqlState: "23505",
      constraint: "User_email_key",
    };

    expect(isDuplicateEmailError(error)).toBe(true);
  });

  it("rejects violations of other unique constraints", () => {
    const error = {
      sqlState: "23505",
      constraint: "Session_tokenHash_key",
    };

    expect(isDuplicateEmailError(error)).toBe(false);
  });

  it("rejects unrelated database errors", () => {
    const error = {
      sqlState: "23503",
      constraint: "User_email_key",
    };

    expect(isDuplicateEmailError(error)).toBe(false);
  });

  it("handles errors without the expected properties", () => {
    expect(isDuplicateEmailError(new Error("Database unavailable"))).toBe(false);
    expect(isDuplicateEmailError(null)).toBe(false);
    expect(isDuplicateEmailError("Unknown error")).toBe(false);
  });
});
