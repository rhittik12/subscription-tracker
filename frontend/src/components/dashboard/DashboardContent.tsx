'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary } from '@/lib/api';
import { AnalyticsSummary, Subscription } from '@/types';
import { Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatCurrency, getDaysUntil } from '@/lib/utils';
import { getSubscriptions } from '@/lib/api';

const categoryOrder = [
  'Entertainment',
  'Productivity',
  'Utilities & Storage',
  'Food & Lifestyle',
  'News & Reading',
  'Gaming',
];

// Card values are rendered from real subscription fields (amount, billing_cycle, next_renewal_date, status).

function formatCardDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export function DashboardContent() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    async function fetchData() {
      try {
        const summaryData = await getAnalyticsSummary();
        setSummary(summaryData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const refresh = async () => {
      try {
        const subscriptionData = await getSubscriptions();
        setSubscriptions(subscriptionData);
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error);
      }
    };

    refresh();
    window.addEventListener('subscriptions-updated', refresh);

    return () => {
      window.removeEventListener('subscriptions-updated', refresh);
    };
  }, []);

  const monthlySpend = summary
    ? formatCurrency(summary.total_monthly, summary.currency)
    : '--';
  const upcomingTotal = summary
    ? formatCurrency(summary.renewing_this_week > 0 ? summary.total_monthly * 0.32 : 0, summary.currency)
    : '--';
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery) return subscriptions;
    return subscriptions.filter((sub) => {
      const haystacks = [
        sub.name,
        sub.category_name ?? '',
        sub.notes ?? '',
        sub.template_id?.toString() ?? ''
      ].map((v) => String(v).toLowerCase());
      return haystacks.some((value) => value.includes(searchQuery));
    });
  }, [searchQuery, subscriptions]);

  const visibleSubscriptions = useMemo(() => filteredSubscriptions.slice(0, visibleCount), [filteredSubscriptions, visibleCount]);
  const canViewMore = visibleCount < filteredSubscriptions.length;

  const subscriptionIndexMap = useMemo(() => {
    const indexMap = new Map<number, number>();
    subscriptions.forEach((subscription, index) => {
      indexMap.set(subscription.id, index);
    });
    return indexMap;
  }, [subscriptions]);

  useEffect(() => {
    setVisibleCount((prev) => Math.min(prev, Math.max(subscriptions.length, 5)));
  }, [subscriptions.length]);

  const groupedVisibleSubscriptions = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          services: visibleSubscriptions.filter((s) => s.category_name === category),
        }))
        .filter((g) => g.services.length > 0),
    [visibleSubscriptions]
  );

  return (
    <div className="space-y-10">
      {/* Summary cards with glow effects */}
      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        {/* Monthly Spend — hero card with glow */}
        <div className="col-span-12 lg:col-span-5 relative">
          <div className="glow -inset-6 bg-white/15" />
          <div className="glass-card glass-reflection rounded-2xl p-7 lg:p-8 relative z-10">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Total Monthly Spend
            </span>
            <p className={`mt-4 font-headline text-4xl font-extrabold tracking-tight text-white lg:text-6xl ${loading ? 'animate-pulse' : ''}`}>
              {monthlySpend}
            </p>
            <div className="mt-5 flex items-center gap-2 text-white/40">
              <TrendingUp size={16} className="text-emerald-400" />
              <span className="text-sm font-semibold">{summary?.active_count ?? 0} active assets this cycle</span>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="col-span-12 lg:col-span-3 relative">
          <div className="glow -inset-4 bg-violet-500/10" />
          <div className="glass-card glass-reflection rounded-2xl p-6 lg:p-8 relative z-10">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Upcoming Payments
            </span>
            <p className={`mt-4 font-headline text-4xl font-bold tracking-tight text-white/90 ${loading ? 'animate-pulse' : ''}`}>
              {upcomingTotal}
            </p>
            <p className="mt-2 text-sm text-white/35">Due in next 7 days</p>
            <div className="mt-6 flex gap-1">
              <div className="h-1 flex-1 rounded-full bg-white/80" />
              <div className="h-1 flex-1 rounded-full bg-white/40" />
              <div className="h-1 flex-1 rounded-full bg-white/[0.06]" />
            </div>
          </div>
        </div>

        {/* Active Assets */}
        <div className="col-span-12 lg:col-span-4 relative">
          <div className="glow -inset-4 bg-white/10" />
          <div className="glass-card glass-reflection rounded-2xl p-6 lg:p-8 relative z-10">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-white/35">
              Active Assets
            </span>
            <p className={`mt-4 font-headline text-4xl font-bold tracking-tight text-white/90 ${loading ? 'animate-pulse' : ''}`}>
              {summary?.active_count ?? '--'}
            </p>
            <p className="mt-2 text-sm text-white/35">Subscription protocols active</p>
            <div className="mt-6 flex -space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white/85 ring-2 ring-[#050816]">N</div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-[10px] font-bold text-violet-400 ring-2 ring-[#050816]">S</div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400 ring-2 ring-[#050816]">A</div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/40 ring-2 ring-[#050816]">
                +{Math.max((summary?.active_count ?? 0) - 3, 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add subscription button */}
      <div className="flex items-center justify-end">
        <Link
          href="/subscriptions"
          className="glass-btn inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          <Plus size={18} />
          Add Subscription
        </Link>
      </div>

      {/* Service cards by category */}
      <section className="space-y-8">
        {filteredSubscriptions.length === 0 ? (
          <div className="glass-card glass-reflection rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold text-white/80">
              {searchQuery ? 'No services match your search.' : 'No services available.'}
            </p>
            <p className="mt-2 text-sm text-white/35">
              {searchQuery ? 'Try another service, category, or domain.' : 'Add a subscription template to get started.'}
            </p>
          </div>
        ) : (
          groupedVisibleSubscriptions.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-headline text-lg font-extrabold text-white/85">{group.category}</h2>
                <span className="text-xs font-semibold text-white/25">{group.services.length} Services</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {group.services.map((service) => {
                  const dueDate = service.next_renewal_date;
                  const status = service.status;
                  const daysUntil = getDaysUntil(dueDate);
                  const isExpiring = daysUntil <= 7 && daysUntil >= 0;

                  return (
                    <div
                      key={service.id}
                      className="glass-card glass-reflection rounded-2xl p-4"
                    >
                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between">
                          <img
                            src={service.logo_url ?? '/placeholder-logo.png'}
                            alt={`${service.name} logo`}
                            className="h-9 w-9 rounded-lg bg-white/10 object-contain p-1.5"
                            loading="lazy"
                            decoding="async"
                          />
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                            isExpiring
                              ? 'glass-chip text-amber-400'
                              : status === 'active'
                              ? 'glass-chip text-emerald-400'
                              : 'glass-chip text-white/30'
                          }`}>
                            {isExpiring ? 'expiring' : status}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-white/90">{service.name}</p>
                        <p className="mt-0.5 text-xs text-white/30">{service.billing_cycle}</p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">Monthly</p>
                            <p className="font-headline text-xl font-bold text-white/90">{formatCurrency(parseFloat(service.amount), service.currency)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">Next Due</p>
                            <p className={`text-sm font-bold ${isExpiring ? 'text-rose-400' : 'text-white/70'}`}>
                              {formatCardDueDate(dueDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {canViewMore && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 5, filteredSubscriptions.length))}
              className="glass-btn rounded-2xl px-6 py-2.5 text-sm font-semibold"
            >
              View More
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
