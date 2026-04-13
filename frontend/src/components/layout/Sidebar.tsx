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
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col px-4 py-8 z-50 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border-r border-white/[0.06] backdrop-blur-2xl">
      {/* Inner light reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none rounded-none" />

      <div className="relative z-10 px-4 pb-8">
        <h1 className="font-headline text-lg font-extrabold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          subscription tracker
        </h1>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/25">
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
                'group relative flex items-center gap-3 px-4 py-3 text-sm font-semibold tracking-tight transition-all duration-300 rounded-xl',
                isActive
                  ? 'text-white/85 bg-white/[0.06]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 h-8 w-1 rounded-full bg-white/85 shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
              )}
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 mt-auto glass-chip rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/10 text-white/80 ring-1 ring-white/10">
            <CircleUserRound size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white/80">Workspace User</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/30">Premium</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
