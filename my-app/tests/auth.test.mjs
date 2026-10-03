import assert from 'node:assert/strict';
import { test } from 'node:test';
import { provisionProfile } from '../src/lib/auth/profile.ts';
import { readCredentials } from '../src/lib/auth/validation.ts';

const profile = { userId: 42, email: 'member@example.com', supabaseAuthId: 'verified-auth-id' };
const identity = { id: profile.supabaseAuthId, email: profile.email };

test('repeat login resolves by verified Auth ID without creating another profile', async () => {
  const result = await provisionProfile(identity, {
    findByAuthId: async (id) => { assert.equal(id, identity.id); return profile; },
    create: async () => { assert.fail('must not create a duplicate'); },
  });
  assert.equal(result.userId, 42);
});

test('first login creates the profile with the verified identity', async () => {
  const result = await provisionProfile(identity, {
    findByAuthId: async () => null,
    create: async (id, email) => { assert.equal(id, identity.id); assert.equal(email, identity.email); return profile; },
  });
  assert.equal(result.supabaseAuthId, identity.id);
});

test('concurrent first logins recover the winning insert by Auth ID', async () => {
  let reads = 0;
  const result = await provisionProfile(identity, {
    findByAuthId: async () => ++reads === 1 ? null : profile,
    create: async () => { throw new Error('unique conflict'); },
  });
  assert.equal(result.userId, 42);
});

test('a duplicate email never claims an unlinked or different account', async () => {
  await assert.rejects(provisionProfile(identity, {
    findByAuthId: async () => null,
    create: async () => { throw new Error('email already belongs to another profile'); },
  }), /email already belongs/);
});

test('missing identity/email cannot create a profile', async () => {
  const store = {
    findByAuthId: async () => { assert.fail('must reject before database access'); },
    create: async () => { assert.fail('must reject before database access'); },
  };
  await assert.rejects(provisionProfile({ id: '' }, store));
  await assert.rejects(provisionProfile({ id: identity.id }, store));
});

function form(email, password, confirmation = password) {
  const data = new FormData();
  data.set('email', email);
  data.set('password', password);
  data.set('confirmPassword', confirmation);
  return data;
}

test('normalizes email without modifying password spaces', () => {
  assert.deepEqual(readCredentials(form(' Member@Example.COM ', ' keep spaces '), true), {
    email: 'member@example.com', password: ' keep spaces ',
  });
});

test('validates email, signup confirmation, password length, and file inputs', () => {
  for (const input of [form('bad-email', 'password123'), form(profile.email, 'short'), form(profile.email, 'password123', 'different'), form(profile.email, 'x'.repeat(129))]) {
    assert.ok(readCredentials(input, true).error);
  }
  const input = form(profile.email, 'password123');
  input.set('password', new Blob(['password123']), 'secret.txt');
  assert.ok(readCredentials(input, true).error);
});

test('login does not enforce new signup password minimum on existing accounts', () => {
  assert.equal(readCredentials(form(profile.email, 'older')).password, 'older');
  assert.ok(readCredentials(form(profile.email, '')).error);
});
