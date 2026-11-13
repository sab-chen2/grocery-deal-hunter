
import { describe, expect, it } from "vitest";
import { registerSchema } from "./register";

describe("Registration validation", () => {
  it("accepts valid registration information", () => {
    const result = registerSchema.safeParse({
      email: "Student@Example.com",
      password: "MySecurePassword123!",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("student@example.com");
    }
  });

  it("rejects invalid email addresses", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "MySecurePassword123!",
    });

    expect(result.success).toBe(false);
  });

  it("rejects passwords shorter than 12 characters", () => {
    const result = registerSchema.safeParse({
      email: "student@example.com",
      password: "short123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing passwords", () => {
    const result = registerSchema.safeParse({
      email: "student@example.com",
    });

    expect(result.success).toBe(false);
  });
});

