'use client';

import { Subscription } from '@/types';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  loading: boolean;
}

export function UpcomingRenewals({ subscriptions, loading }: UpcomingRenewalsProps) {
  return (
    <div className="glass-card glass-reflection rounded-2xl p-8 lg:col-span-4">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-xl font-bold text-white/85">Upcoming Bills</h3>
          <span className="text-sm text-white/30">Next 30 days</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-chip h-16 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-white/30">
            <Clock size={32} className="mb-2" />
            <p>No upcoming renewals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const daysUntil = getDaysUntil(sub.next_renewal_date);
              let badgeColor = 'bg-emerald-500/15 text-emerald-400';
              if (daysUntil <= 3) badgeColor = 'bg-rose-500/15 text-rose-400';
              else if (daysUntil <= 7) badgeColor = 'bg-amber-500/15 text-amber-400';

              return (
                <div
                  key={sub.id}
                  className="glass-chip flex items-center justify-between rounded-2xl p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {sub.logo_url ? (
                      <img
                        src={sub.logo_url}
                        alt={sub.name}
                        className="h-10 w-10 rounded-xl object-contain bg-white/10 p-1.5"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white ring-1 ring-white/10"
                        style={{ backgroundColor: `${sub.category_color}30` }}
                      >
                        {sub.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white/85">{sub.name}</p>
                      <p className="text-xs text-white/30">
                        {formatDate(sub.next_renewal_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-headline text-sm font-bold text-white/80">
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
