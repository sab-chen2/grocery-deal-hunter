# Supabase Auth user mapping

The `link_supabase_auth` migration adds nullable, unique `User.supabaseAuthId` to store a Supabase Auth UUID, and drops the old `User.passwordHash` column. Existing integer user IDs and relations remain intact; current rows have a null Auth ID until deliberately linked.

This creates no Supabase Auth accounts and does not link existing rows by email. Apply the committed migration to each development database before using the new contract. It has already been applied to the configured Supabase project; see PR history for the live application. Dropping the old password-hash values is irreversible, so complete any legacy auth transition first if those values are still needed.

From `my-app`, point `DATABASE_URL` at the target database and run:

```powershell
npx.cmd prisma migration check
npx.cmd prisma migration show 20261003T0423_link_supabase_auth
npx.cmd prisma db migrate --show
```

Review the migration preview, then apply and verify:

```powershell
npx.cmd prisma db migrate
npx.cmd prisma migration status
```

The resulting `supabaseAuthId` stays nullable until existing profiles have a deliberate, verified link. When linking in application code, use the UUID from a verified server-side Supabase session. Never claim an unlinked account based only on a matching submitted email.
