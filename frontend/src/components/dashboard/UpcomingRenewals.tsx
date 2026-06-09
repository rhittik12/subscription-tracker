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
    <div className="glass-card glass-reflection rounded-2xl p-8 lg:col-span-4">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-bold text-black">Upcoming Bills</h3>
          <span className="text-sm text-black">Next 30 days</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-chip h-16 rounded-2xl animate-pulse" />
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
              let badgeColor = 'bg-emerald-500/15 text-black';
              if (daysUntil <= 3) badgeColor = 'bg-rose-500/15 text-black';
              else if (daysUntil <= 7) badgeColor = 'bg-amber-500/15 text-black';

              return (
                <div
                  key={sub.id}
                  className="glass-chip flex items-center justify-between rounded-2xl p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {resolveLogoUrl(sub.logo_url) ? (
                      <img
                        src={resolveLogoUrl(sub.logo_url) || undefined}
                        alt={sub.name}
                        className="h-10 w-10 rounded-xl object-contain bg-white/10 p-1.5"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-black ring-1 ring-white/10"
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
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badgeColor}`}>
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
