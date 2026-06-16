import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div>
        <Link href="/" className="landing-logo">SubTrack</Link>
        <p className="mt-2 text-sm font-semibold text-black/60">© 2026 SubTrack. Built for the meticulous.</p>
      </div>
      <div className="flex flex-wrap gap-5 text-sm font-bold">
        <a href="#features">Features</a>
        <a href="#faq">FAQ</a>
        <Link href="/sign-in">Sign In</Link>
      </div>
    </footer>
  );
}
