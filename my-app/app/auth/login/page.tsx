import { AuthForm } from "../auth-form";

export const metadata = { title: "Log in | Grocery Deal Hunter" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <>
    <h1 className="text-3xl font-bold">Welcome back</h1>
    <p className="mt-3 text-foreground/70">Log in to plan your next grocery trip.</p>
    {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/40 p-3 text-sm">
      {error === "profile" ? "Your email is verified, but your app profile could not be linked. Try logging in; contact the project team if this continues." : "That confirmation link is invalid or expired. If your email is already confirmed, log in below. Otherwise, sign up again to request another link."}
    </p>}
    <AuthForm mode="login" />
  </>;
}
