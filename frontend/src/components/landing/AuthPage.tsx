import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const isSignUp = mode === 'sign-up';
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
          {isSignUp && <label>Name<input type="text" placeholder="Your name" /></label>}
          <label>Email<input type="email" placeholder="you@example.com" /></label>
          <label>Password<input type="password" placeholder="••••••••" /></label>
          <Link href="/dashboard" className="landing-button bg-black text-white">{isSignUp ? 'Create account' : 'Sign in'} <ArrowRight size={20} /></Link>
          <p>{isSignUp ? 'Already have an account?' : 'New to SubTrack?'} <Link href={isSignUp ? '/sign-in' : '/sign-up'}>{isSignUp ? 'Sign in' : 'Create an account'}</Link></p>
        </form>
      </section>
    </main>
  );
}
