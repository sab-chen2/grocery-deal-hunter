"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/src/lib/supabase/server";
import { getAppUser } from "@/src/lib/auth/user";
import { readCredentials, type AuthState } from "@/src/lib/auth/validation";

async function finishSignIn(): Promise<AuthState> {
  try {
    if (!(await getAppUser())) return { error: "Your session could not be verified. Please log in again." };
  } catch {
    return { error: "You are authenticated, but we could not open your app profile. Retry login; if this continues, contact the project team to check your account link." };
  }
  revalidatePath("/", "layout");
  redirect("/shoppinglist");
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const input = readCredentials(formData);
  if ("error" in input) return { error: input.error };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(input);
    if (error) {
      return { error: error.code === "email_not_confirmed"
        ? "Confirm your email before logging in. Check your inbox for the signup email."
        : "Unable to log in. Check your email and password, then try again." };
    }
  } catch {
    return { error: "Login is temporarily unavailable. Please try again." };
  }
  return finishSignIn();
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const input = readCredentials(formData, true);
  if ("error" in input) return { error: input.error };
  let hasSession = false;
  try {
    const siteUrl = process.env.SITE_URL || (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
    if (!siteUrl) return { error: "Signup is not configured yet. Contact the project team." };
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      ...input,
      options: { emailRedirectTo: new URL("/auth/callback", siteUrl).toString() },
    });
    if (error) {
      return { error: error.code === "weak_password"
        ? "Choose a stronger password that meets the project's password policy."
        : "Unable to sign up right now. Try again later, or log in if you already have an account." };
    }
    hasSession = !!data.session;
  } catch {
    return { error: "Signup is temporarily unavailable. Please try again." };
  }
  if (hasSession) return finishSignIn();
  return { message: "Check your email for a confirmation link. If you already have an account, log in instead." };
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) redirect("/shoppinglist?error=logout");
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
