import Link from "next/link";
import { requireAppUser } from "@/src/lib/auth/user";
import { db } from "@/src/prisma/db";
import { logout } from "@/app/auth/actions";

export default async function ShoppingListPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireAppUser();
  const lists = await db.orm.public.GroceryList.where({ userId: user.userId }).select("listId", "name").all();
  const { error } = await searchParams;
  return <main className="mx-auto w-full max-w-3xl px-6 py-12">
    <Link href="/" className="text-sm underline">Back to home</Link>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-3xl font-bold">My shopping lists</h1>
      <form action={logout}><button className="rounded-lg border border-foreground/25 px-4 py-2">Log out</button></form>
    </div>
    <p className="mt-3 text-foreground/70">Signed in as {user.email}</p>
    {error === "logout" && <p role="alert" className="mt-4">Logout failed. Please try again.</p>}
    {lists.length ? <ul className="mt-8 space-y-3">{lists.map((list) => <li key={list.listId} className="rounded-lg border border-foreground/15 p-4">{list.name}</li>)}</ul>
      : <p className="mt-8 rounded-lg border border-foreground/15 p-6">You don’t have any grocery lists yet.</p>}
  </main>;
}
