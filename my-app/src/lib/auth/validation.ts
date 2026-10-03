export type AuthState = { error?: string; message?: string };

export function readCredentials(formData: FormData, signup = false) {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." } as const;
  }
  if (!password || password.length > 128 || (signup && password.length < 8)) {
    return { error: signup ? "Use a password between 8 and 128 characters." : "Enter your password (up to 128 characters)." } as const;
  }
  if (signup && formData.get("confirmPassword") !== password) {
    return { error: "Your passwords do not match." } as const;
  }
  return { email, password } as const;
}
