'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Bell,
  CircleHelp,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSearchableRoute = pathname === '/dashboard';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(isSearchableRoute ? searchParams.get('q') ?? '' : '');
  const currentSearch = searchParams.get('q') ?? '';
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!isSearchableRoute) return;
    setSearchValue(currentSearch);
  }, [currentSearch, isSearchableRoute]);

  useEffect(() => {
    if (!isSearchableRoute || searchValue.trim() === currentSearch) return;

    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParamsString);
      const trimmedSearch = searchValue.trim();

      if (trimmedSearch) {
        nextParams.set('q', trimmedSearch);
      } else {
        nextParams.delete('q');
      }

      const queryString = nextParams.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [currentSearch, isSearchableRoute, pathname, router, searchParamsString, searchValue]);

  const searchPlaceholder = 'Search services, categories, or domains...';

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/subscriptions', label: 'Subscriptions' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <nav className="sticky top-0 z-40 glass-panel rounded-2xl px-4 py-4 lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
        <div className="order-1 flex min-w-0 flex-1 items-center gap-3">
          <button
            className="mobile-nav-button shrink-0 lg:hidden rounded-xl p-2 text-black transition-colors hover:bg-white/10 hover:text-white/80"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {isSearchableRoute ? (
            <div className="group relative w-full max-w-xl">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full border-[3px] border-black bg-white px-4 py-3 pl-11 text-sm font-bold text-black placeholder:text-black/60 outline-none brutalist-shadow focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0_0_#000000]"
                aria-label="Search"
              />
            </div>
          ) : (
            <div className="w-full max-w-xl" />
          )}
        </div>

        <div className="order-2 flex shrink-0 items-center gap-2">
          <button className="mobile-nav-button glass-chip rounded-xl p-2.5 text-black transition-all duration-300 hover:text-black" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="mobile-hide glass-chip hidden rounded-xl p-2.5 text-black transition-all duration-300 hover:text-black sm:inline-flex" aria-label="Help">
            <CircleHelp size={18} />
          </button>
          <div className="hidden h-9 w-9 rounded-full bg-gradient-to-br from-white/80 to-white/40 shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:block" />
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
                  : 'text-black/70 hover:bg-white/30 hover:text-black'
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
