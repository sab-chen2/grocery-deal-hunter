
import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(12, "Password must contain at least 12 characters")
    .max(128, "Password must contain at most 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

