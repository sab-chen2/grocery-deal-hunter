export type AppProfile = { userId: number; email: string; supabaseAuthId: string | null };
export type ProfileStore = {
  findByAuthId: (id: string) => Promise<AppProfile | null | undefined>;
  create: (id: string, email: string) => Promise<AppProfile>;
};

// Call only after Supabase verifies the identity on the server.
// Never link by email: an existing unlinked account needs explicit reconciliation.
export async function provisionProfile(
  identity: { id: string; email?: string },
  store: ProfileStore,
): Promise<AppProfile> {
  if (!identity.id || !identity.email) throw new Error("A verified email account is required.");
  const existing = await store.findByAuthId(identity.id);
  if (existing) return existing;
  try {
    return await store.create(identity.id, identity.email);
  } catch (error) {
    // Concurrent first requests may race on the unique Auth ID. Re-read only
    // that identity; a duplicate email must never grant access to another user.
    const concurrent = await store.findByAuthId(identity.id);
    if (concurrent) return concurrent;
    throw error;
  }
}
