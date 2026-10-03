import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex flex-1 flex-col items-center px-6 py-12 sm:py-20">
    <Link href="/" className="mb-8 text-xl font-bold">Grocery Deal Hunter</Link>
    <section className="w-full max-w-md rounded-2xl border border-foreground/15 p-6 shadow-sm sm:p-8">{children}</section>
  </main>;
}
