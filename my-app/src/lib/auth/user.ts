import "server-only";

import { redirect } from "next/navigation";
import { db } from "@/src/prisma/db";
import { createClient } from "@/src/lib/supabase/server";
import { provisionProfile } from "./profile";

export async function getAppUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  return provisionProfile(user, {
    findByAuthId: async (id) => db.orm.public.User
      .where({ supabaseAuthId: id }).select("userId", "email", "supabaseAuthId").first(),
    create: async (id, email) => db.orm.public.User
      .select("userId", "email", "supabaseAuthId")
      .create({ supabaseAuthId: id, email }),
  });
}

export async function requireAppUser() {
  const user = await getAppUser();
  if (!user) redirect("/auth/login");
  return user;
}
