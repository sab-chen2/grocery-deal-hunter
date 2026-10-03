"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, signup } from "./actions";
import type { AuthState } from "@/src/lib/auth/validation";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState<AuthState, FormData>(isSignup ? signup : login, {});
  const inputClass = "mt-2 w-full rounded-lg border border-foreground/25 bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-emerald-600";
  return (
    <form action={action} className="mt-8 space-y-5" aria-busy={pending}>
      <fieldset disabled={pending} className="space-y-5 disabled:opacity-60">
        <div>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} className={inputClass} />
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input id="password" name="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={isSignup ? 8 : undefined} maxLength={128} aria-describedby={isSignup ? "password-help" : undefined} className={inputClass} />
          {isSignup && <p id="password-help" className="mt-2 text-sm text-foreground/65">Use at least 8 characters.</p>}
        </div>
        {isSignup && <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className={inputClass} />
        </div>}
        <button type="submit" className="w-full rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait">
          {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
        </button>
      </fieldset>
      <div aria-live="polite">
        {state.error && <p role="alert" className="rounded-lg border border-red-500/40 p-3 text-sm">{state.error}</p>}
        {state.message && <p role="status" className="rounded-lg border border-emerald-500/40 p-3 text-sm">{state.message}</p>}
      </div>
      <p className="text-center text-sm text-foreground/75">
        {isSignup ? "Already have an account? " : "New to Grocery Deal Hunter? "}
        <Link className="font-semibold underline underline-offset-4" href={isSignup ? "/auth/login" : "/auth/signup"}>{isSignup ? "Log in" : "Sign up"}</Link>
      </p>
    </form>
  );
}
