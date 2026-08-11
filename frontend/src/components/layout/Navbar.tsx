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
    <nav className="sticky top-0 z-40 border-b-2 border-black bg-[#fcfaf7] px-[clamp(20px,4vw,48px)] py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
        <div className="order-1 flex min-w-0 flex-1 items-center gap-3">
          <button
            className="app-icon-button mobile-nav-button shrink-0 lg:hidden"
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
                className="app-field pl-11"
                aria-label="Search"
              />
            </div>
          ) : (
            <div className="w-full max-w-xl" />
          )}
        </div>

        <div className="order-2 flex shrink-0 items-center gap-2">
          <button className="app-icon-button mobile-nav-button" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="app-icon-button mobile-hide hidden sm:inline-flex" aria-label="Help">
            <CircleHelp size={18} />
          </button>
          <div className="hidden h-[42px] w-[42px] border-2 border-black bg-[#d9ff63] shadow-[4px_4px_0_#111] sm:block" />
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="app-panel app-panel-lime mt-4 space-y-2 p-3 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block border-2 px-3 py-2.5 text-sm font-extrabold uppercase transition-all duration-150',
                pathname === link.href
                  ? 'border-black bg-white text-black shadow-[3px_3px_0_#111]'
                  : 'border-transparent text-black/75 hover:border-black hover:bg-white/50 hover:text-black'
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
