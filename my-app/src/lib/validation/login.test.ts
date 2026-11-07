import { describe, it, expect } from "vitest";
import { loginSchema } from "./login";

describe("loginSchema", () => {
  it("accepts valid login credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "SecurePassword123!",
    });

    expect(result.success).toBe(true);
  });

  it("normalizes email addresses to lowercase", () => {
    const result = loginSchema.safeParse({
      email: "USER@EXAMPLE.COM",
      password: "password",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("rejects invalid email addresses", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty passwords", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts passwords shorter than the registration minimum", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });

    expect(result.success).toBe(true);
  });
});
