import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getAppUser } from "@/src/lib/auth/user";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let destination = "/auth/login?error=confirmation";
  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        destination = "/auth/login?error=profile";
        if (await getAppUser()) destination = "/shoppinglist";
      }
    } catch {
      // Display a retry path without exposing provider/database errors or tokens.
    }
  }
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
