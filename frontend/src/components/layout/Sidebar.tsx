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
import { SignOut } from './SignOut';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside data-sidebar className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] flex-col px-5 py-8 z-50">
      <div className="relative z-10 px-2 pb-9">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-black">
          SubTrack
        </h1>
        <p className="mt-2 inline-flex border-2 border-black bg-white px-2 py-1 text-[10px] font-black uppercase text-black shadow-[3px_3px_0_#111]">
          Money Control
        </p>
      </div>

      <nav className="relative z-10 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 border-2 border-transparent px-4 py-3 text-sm font-extrabold uppercase transition-all duration-150',
                isActive
                  ? 'border-black bg-white text-black shadow-[4px_4px_0_#111]'
                  : 'text-black/80 hover:border-black hover:bg-white/50 hover:text-black'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 mt-auto border-t-2 border-black px-1 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black shadow-[3px_3px_0_#111]">
            <CircleUserRound size={20} />
          </div>
          <SignOut />
        </div>
      </div>
    </aside>
  );
}
