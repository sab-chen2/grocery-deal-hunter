'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { readCredentials } from '@/src/lib/auth/validation';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const signup = mode === 'signup';
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = readCredentials(new FormData(event.currentTarget), signup);
    setError(result.error || '');
    // shortcut: frontend preview only, connect the auth branch's actions before enabling accounts.
    setMessage(result.error ? '' : 'Account access is not available yet. Please continue shopping as a guest.');
  }

  return <div className="auth-card">
    <h2>{signup ? 'Create your account' : 'Log in to your account'}</h2>
    <p className="auth-intro" id="auth-preview">Preview only. Account access is coming soon; these forms do not send or save your details.</p>
    <form className="auth-form" method="post" onSubmit={submit} aria-describedby="auth-preview" onChange={() => { setError(''); setMessage(''); }}>
      <div className="auth-field">
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} placeholder="you@example.com" />
      </div>
      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <div className="auth-password">
          <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} required minLength={signup ? 8 : undefined} maxLength={128} aria-describedby={signup ? 'password-help' : undefined} />
          <button type="button" className="auth-show" aria-label={showPassword ? 'Hide passwords' : 'Show passwords'} aria-pressed={showPassword} aria-controls={signup ? 'password confirmPassword' : 'password'} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        {signup && <p className="auth-help" id="password-help">Use between 8 and 128 characters.</p>}
      </div>
      {signup && <div className="auth-field">
        <label htmlFor="confirmPassword">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength={8} maxLength={128} />
      </div>}
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      {message && <p className="auth-feedback" role="status">{message}</p>}
      <button type="submit" className="auth-submit">{signup ? 'Create account' : 'Log in'} <span aria-hidden="true">→</span></button>
    </form>
    <p className="auth-switch">{signup ? 'Already have an account? ' : 'New here? '}<Link href={signup ? '/login' : '/signup'}>{signup ? 'Log in' : 'Create an account'}</Link></p>
    <div className="auth-guest"><Link href="/">Continue shopping as a guest <span aria-hidden="true">→</span></Link><p>No account needed to build a list and compare prices.</p></div>
  </div>;
}
