import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { getAppUser } from "@/src/lib/auth/user";

// Optional token-hash email template; also works when opening email on another device.
export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  let destination = "/auth/login?error=confirmation";
  if (tokenHash && type === "signup") {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "signup" });
      if (!error) {
        destination = "/auth/login?error=profile";
        if (await getAppUser()) destination = "/shoppinglist";
      }
    } catch {
      // Tokens and database errors must not appear in redirects or page content.
    }
  }
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
