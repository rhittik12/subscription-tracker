'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignUp = mode === 'sign-up';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleAuth() {
    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });

      if (authError) {
        setError(authError.message || 'Google authentication failed.');
        setIsLoading(false);
      }
    } catch {
      setError('Google authentication failed. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-pitch">
        <Link href="/" className="landing-logo text-white">SubTrack</Link>
        <div><p className="auth-kicker">LESS SURPRISE. MORE CONTROL.</p><h1>YOUR MONEY SHOULD NOT DISAPPEAR QUIETLY.</h1>
          <ul>{['See every recurring payment', 'Get ahead of renewal dates', 'Understand your monthly spend'].map(item => <li key={item}><Check size={20} />{item}</li>)}</ul>
        </div>
      </section>
      <section className="auth-form-wrap">
        <Link href="/" className="auth-back"><ArrowLeft size={18} /> Back home</Link>
        <form className="auth-form">
          <span className="plan-label">{isSignUp ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</span>
          <h2>{isSignUp ? 'Start tracking.' : 'Sign in.'}</h2>
          <button
            type="button"
            className="landing-button bg-black text-white"
            disabled={isLoading}
            onClick={handleGoogleAuth}
          >
            {isLoading ? 'Opening Google...' : `${isSignUp ? 'Continue' : 'Sign in'} with Google`}
            <ArrowRight size={20} />
          </button>
          {error && <p className="auth-error">{error}</p>}
          <p>{isSignUp ? 'Already have an account?' : 'New to SubTrack?'} <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link></p>
        </form>
      </section>
    </main>
  );
}
