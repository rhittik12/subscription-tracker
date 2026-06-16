import Link from 'next/link';

export function LandingNavbar() {
  return (
    <header className="landing-nav">
      <Link href="/" className="landing-logo">SubTrack</Link>
      <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
        <a href="#features">Features</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/sign-in" className="landing-button landing-button-small bg-white">Sign In</Link>
        <Link href="/sign-up" className="landing-button landing-button-small bg-black text-white">Sign Up</Link>
      </div>
    </header>
  );
}
