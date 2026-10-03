import { AuthForm } from "../auth-form";

export const metadata = { title: "Sign up | Grocery Deal Hunter" };

export default function SignupPage() {
  return <>
    <h1 className="text-3xl font-bold">Create your account</h1>
    <p className="mt-3 text-foreground/70">Keep your grocery lists and favorite finds in one place.</p>
    <AuthForm mode="signup" />
  </>;
}
