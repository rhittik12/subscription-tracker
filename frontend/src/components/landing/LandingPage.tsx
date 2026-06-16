import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  Check,
  CircleDollarSign,
  Layers3,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LandingFooter } from './LandingFooter';
import { LandingNavbar } from './LandingNavbar';

const problems = [
  { icon: CalendarClock, title: 'Forgotten renewals', copy: 'Stop waking up to bank alerts for services you meant to cancel months ago.' },
  { icon: BellRing, title: 'Trial subscriptions', copy: 'Free trials are not free when you forget to cancel before the clock runs out.' },
  { icon: Layers3, title: 'Multiple services', copy: 'Keep streaming, work, storage, and lifestyle services in one clear view.' },
  { icon: CircleDollarSign, title: 'Hidden costs', copy: 'Catch the small recurring charges that quietly add up every year.' },
];

const faqs = [
  ['How secure is my data?', 'Your account data is protected and never sold to third parties.'],
  ['Can I add subscriptions manually?', 'Yes. Add any service, billing cycle, price, and renewal date in seconds.'],
  ['What types of alerts do you send?', 'Get reminders for upcoming renewals, trial expirations, and scheduled payments.'],
  ['Can I use SubTrack on mobile?', 'Yes. The responsive web app works across phones, tablets, and desktops.'],
];

export function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main>
        <section className="landing-hero">
          <div className="landing-kicker"><Sparkles size={16} /> Your subscriptions, finally under control</div>
          <h1>KNOW WHERE YOUR MONEY GOES.</h1>
          <p>Track subscriptions, renewal dates, and monthly spending from one clean dashboard. No forgotten trials. No surprise charges.</p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up" className="landing-button landing-button-large bg-black text-white">Start Tracking <ArrowRight size={22} /></Link>
            <Link href="/sign-in" className="landing-button landing-button-large bg-white">Sign In</Link>
          </div>
          
          <div className="dashboard-preview brutalist-shadow sm:p-6">
            <div className="preview-sidebar">
              <strong>SubTrack</strong>
              <span className="preview-active">Overview</span>
              <span>Subscriptions</span>
              <span>Settings</span>
            </div>
            <div className="preview-main">
              <div className="preview-heading"><span>MONTHLY OVERVIEW</span><span>JUNE 2026</span></div>
              <div className="preview-stats">
                <div><small>MONTHLY SPEND</small><strong>$184.20</strong></div>
                <div><small>ACTIVE</small><strong>12</strong></div>
                <div><small>NEXT PAYMENT</small><strong>$14.99</strong></div>
              </div>
              <div className="preview-list">
                {['Netflix', 'Notion', 'Adobe Creative Cloud'].map((name, index) => (
                  <div key={name}><span className="preview-icon">{name[0]}</span><b>{name}</b><span>{['$15.49', '$10.00', '$54.99'][index]}</span><span>{['JUN 18', 'JUN 22', 'JUL 02'][index]}</span></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-band">
          <h2>THE SUBSCRIPTION CHAOS</h2>
          <div className="landing-grid-four ">
            {problems.map(({ icon: Icon, title, copy }) => (
              <article className="landing-card brutalist-shadow sm:p-6" key={title}><Icon size={34} /><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
        </section>

        <section id="features" className="landing-section">
          <div className="section-heading"><span>BUILT FOR CLARITY</span><h2>EVERYTHING YOU NEED. NOTHING YOU DON&apos;T.</h2></div>
          <div className="feature-grid">
            <article className="landing-card feature-black brutalist-shadow sm:p-6"><BellRing size={38} /><h3>Renewal reminders</h3><p>Know before the charge lands, so you decide what stays and what goes.</p></article>
            <article className="landing-card brutalist-shadow sm:p-6"><CircleDollarSign size={38} /><h3>Spending overview</h3><p>See your monthly and yearly subscription spend at a glance.</p></article>
            <article className="landing-card brutalist-shadow sm:p-6"><ShieldCheck size={38} /><h3>Your data stays yours</h3><p>Simple, private tracking without selling your financial information.</p></article>
          </div>
        </section>

        <section className="how-section">
          <h2>HOW IT WORKS</h2>
          <div className="how-grid">
            {[
              ['01', 'Create account', 'Set up your private workspace.'],
              ['02', 'Add subscriptions', 'Enter services and renewal dates.'],
              ['03', 'Stay informed', 'Review spend and upcoming charges.'],
            ].map(([number, title, copy]) => <article key={number}><b>{number}</b><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section id="faq" className="landing-band">
          <div className="faq-wrap"><h2>QUESTIONS</h2>{faqs.map(([question, answer], index) => (
            <details className="faq-item brutalist-shadow sm:p-2" key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>
          ))}</div>
        </section>

        <section className="final-cta"><h2>STOP PAYING FOR SUBSCRIPTIONS YOU FORGOT ABOUT.</h2><Link href="/sign-up" className="landing-button landing-button-large bg-black text-white">Sign Up Free <ArrowRight size={22} /></Link></section>
      </main>
      <LandingFooter />
    </div>
  );
}
