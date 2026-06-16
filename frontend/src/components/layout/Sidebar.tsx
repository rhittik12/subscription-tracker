'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  CircleUserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside data-sidebar className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] flex-col px-4 py-8 z-50">
      {/* Inner light reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-none" />

      <div className="relative z-10 px-4 pb-8">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-black">
          SubTrack
        </h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-black">
          Wealth Management
        </p>
      </div>

      <nav className="relative z-10 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all duration-300',
                isActive
                  ? 'text-black bg-[#89ACE7] border-r-[6px] border-black translate-x-1 brutalist-shadow-sm'
                  : 'text-black/80 hover:text-black hover:bg-white/30'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 h-8 w-1 bg-black" />
              )}
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 mt-auto p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/10 text-black ring-1 ring-white/10">
            <CircleUserRound size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-black">Workspace User</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
