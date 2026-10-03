"use client";

import Link from "next/link";

export default function ShoppingListError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-lg p-8">
    <h1 className="text-2xl font-bold">We couldn’t load your account</h1>
    <p className="mt-4">Please retry. If this continues, the project team may need to check your profile link or database connection.</p>
    <button onClick={reset} className="mt-6 rounded-lg border px-4 py-2">Try again</button>
    <Link href="/auth/login" className="ml-4 underline">Back to login</Link>
  </main>;
}
