'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Bell,
  CircleHelp,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/subscriptions', label: 'Subscriptions' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass-panel rounded-2xl px-4 py-4 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <button
            className="lg:hidden rounded-xl p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="group relative w-full max-w-xl">
            <Search
              size={16}
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-white/75"
            />
            <input
              type="text"
              placeholder="Search subscriptions, dates, or providers..."
              className="w-full border-0 border-b border-white/10 bg-transparent pb-2 pl-7 text-sm text-white/90 placeholder:text-white/25 focus:border-white/50 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="glass-chip rounded-xl p-2.5 text-white/40 transition-all duration-300 hover:text-white/80">
            <Bell size={18} />
          </button>
          <button className="glass-chip rounded-xl p-2.5 text-white/40 transition-all duration-300 hover:text-white/80">
            <CircleHelp size={18} />
          </button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-white/80 to-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="glass-panel mt-4 space-y-1 rounded-xl p-2 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300',
                pathname === link.href
                  ? 'glass-chip text-white/85'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80'
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
