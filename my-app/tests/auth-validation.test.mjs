import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readCredentials } from '../src/lib/auth/validation.ts';

function credentials(email = 'shopper@example.com', password = 'a good password', confirmPassword = password) {
  const data = new FormData();
  data.set('email', email);
  data.set('password', password);
  data.set('confirmPassword', confirmPassword);
  return data;
}

test('valid signup normalizes email but preserves the password exactly', () => {
  assert.deepEqual(readCredentials(credentials(' Shopper@Example.com ', ' password with spaces '), true), {
    email: 'shopper@example.com', password: ' password with spaces ',
  });
});

test('invalid email and absent credentials are rejected', () => {
  for (const email of ['', 'shopper', 'shopper@', 'a b@example.com', `${'a'.repeat(250)}@example.com`]) {
    assert.ok(readCredentials(credentials(email)).error);
  }
  assert.ok(readCredentials(new FormData()).error);
});

test('signup enforces password length and confirmation', () => {
  for (const password of ['', 'short', 'x'.repeat(129)]) {
    assert.ok(readCredentials(credentials(undefined, password), true).error);
  }
  assert.equal(readCredentials(credentials(undefined, 'password', 'different'), true).error, 'Your passwords do not match.');
  for (const password of ['x'.repeat(8), 'x'.repeat(128)]) {
    assert.equal(readCredentials(credentials(undefined, password), true).error, undefined);
  }
});

test('login does not apply signup confirmation or minimum-length rules', () => {
  assert.equal(readCredentials(credentials(undefined, 'short', '')).password, 'short');
  assert.ok(readCredentials(credentials(undefined, '')).error);
  assert.ok(readCredentials(credentials(undefined, 'x'.repeat(129))).error);
});
