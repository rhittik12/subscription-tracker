'use client';

import { Subscription } from '@/types';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { resolveLogoUrl } from '@/lib/logo';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  loading: boolean;
}

export function UpcomingRenewals({ subscriptions, loading }: UpcomingRenewalsProps) {
  return (
    <div className="app-panel p-8 lg:col-span-4">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-2xl font-extrabold text-black">Upcoming Bills</h3>
          <span className="glass-chip glass-chip-lime">Next 30 days</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse border-2 border-black bg-[#eae7e2]" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-black">
            <Clock size={32} className="mb-2" />
            <p>No upcoming renewals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const daysUntil = getDaysUntil(sub.next_renewal_date);
              let badgeColor = 'bg-[#d9f0c6] text-black';
              if (daysUntil <= 3) badgeColor = 'bg-[#fca5a5] text-black';
              else if (daysUntil <= 7) badgeColor = 'bg-[#fde68a] text-black';

              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between border-2 border-black bg-white p-4 transition-colors duration-150 hover:bg-[#eae7e2]"
                >
                  <div className="flex items-center gap-3">
                    {resolveLogoUrl(sub.logo_url) ? (
                      <img
                        src={resolveLogoUrl(sub.logo_url) || undefined}
                        alt={sub.name}
                        className="h-10 w-10 border-2 border-black bg-white object-contain p-1.5"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center border-2 border-black text-sm font-bold text-black"
                        style={{ backgroundColor: `${sub.category_color}30` }}
                      >
                        {sub.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-black">{sub.name}</p>
                      <p className="text-xs text-black">
                        {formatDate(sub.next_renewal_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-headline text-sm font-bold text-black">
                      {formatCurrency(parseFloat(sub.amount), sub.currency)}
                    </span>
                    <span className={`border-2 border-black px-2.5 py-1 text-xs font-extrabold uppercase ${badgeColor}`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
