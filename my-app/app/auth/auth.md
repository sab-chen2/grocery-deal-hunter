# Authentication setup

## Implemented

- `/auth/login` and `/auth/signup`: forms calling Server Actions in `actions.ts`.
- `/auth/callback`: PKCE code exchange for the default Supabase confirmation flow.
- `/auth/confirm`: optional signup token-hash confirmation flow.
- `/shoppinglist`: verifies the Supabase user, provisions an app profile, and only queries lists belonging to its integer `userId`.
- Logout: local-session signout via a Server Action.
- Root `proxy.ts` refreshes session cookies for `/auth/*` and `/shoppinglist/*`. Add future protected routes to its matcher, and independently verify identity and ownership inside every protected handler/action.

## Environment

Use the existing private `my-app/.env` with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `DATABASE_URL`. All must refer to the intended Supabase project. No service-role key is needed.

Set `SITE_URL=http://localhost:3000` for local development (the default if unset). If using a different port, update it. Set `SITE_URL` to the deployed HTTPS origin in hosting environment settings before using signup in production. Restart Next.js after changing environment variables.

## Supabase dashboard configuration

1. Enable email/password signup in Authentication's email provider settings.
2. In Authentication URL Configuration, set Site URL to your app origin and allow `http://localhost:3000/auth/callback`. Add the exact deployed `/auth/callback` URL when deploying.
3. Keep the default confirmation email's `{{ .ConfirmationURL }}` link for the PKCE callback flow. Open the email in the same browser used to sign up, which holds the PKCE verifier cookie.
4. Optional cross-device flow: change the Confirm signup template link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`. This requires Site URL to point to the app where confirmation should complete. The handler accepts signup tokens only.
5. Configure an email provider/custom SMTP for broader testing or production; Supabase's built-in mail service restricts recipients and volume. Avoid repeated signup attempts when rate-limited.

These dashboard settings are not changed by the code. Email confirmation enabled: signup shows an inbox message and creates the app profile only after authentication. Confirmation disabled: signup immediately establishes a session and creates the profile.

## Profile linking

The server calls `supabase.auth.getUser()` before accessing Prisma. It finds an app user by unique `supabaseAuthId`, or inserts one with the verified UUID and email. Concurrent first requests re-read the winning insert. It never auto-links an existing record by email; existing unlinked records require a deliberate, verified migration. Profile failures show a retry message rather than database details.

This implementation does not synchronize future email changes, delete accounts, or implement password reset. Supabase Auth manages passwords and sessions; the app's legacy `Session` table is unused by login/signup.

## Verification

Run `node --test tests/auth.test.mjs` using Node 22.18+ (native TypeScript stripping), `npm.cmd run lint`, and `npx.cmd tsc --noEmit`.

Manually verify using a test account you control:

1. Signup, confirm email, arrive at `/shoppinglist`.
2. In Supabase, check one Auth account and one `public.User` row with matching Auth UUID.
3. Log out, then log in again: the same `userId` should remain.
4. Refresh the protected page, then logout and try visiting it again: expect `/auth/login`.
5. Use a second test user and verify only that user's lists appear.
6. Check invalid credentials, mismatched passwords, expired confirmation links, and rate-limit behavior.

Automated tests do not send confirmation emails or create live Supabase accounts.
