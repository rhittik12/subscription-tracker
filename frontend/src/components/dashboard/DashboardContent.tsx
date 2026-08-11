'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary } from '@/lib/api';
import { AnalyticsSummary, Subscription } from '@/types';
import { Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatCurrency, getDaysUntil } from '@/lib/utils';
import { getSubscriptions } from '@/lib/api';
import { resolveLogoUrl } from '@/lib/logo';

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

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase();
  }
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim().toLowerCase();

  const refreshSummary = useCallback(async () => {
    const summaryData = await getAnalyticsSummary();
    setSummary(summaryData);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        await refreshSummary();
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshSummary]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const [subscriptionData] = await Promise.all([
          getSubscriptions(),
          refreshSummary(),
        ]);
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
  }, [refreshSummary]);

  const monthlySpend = summary
    ? formatCurrency(summary.total_monthly, summary.currency)
    : '--';
  const upcomingTotal = summary
    ? formatCurrency(summary.upcoming_total, summary.currency)
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
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <span className="app-kicker">Monthly Overview</span>
          <h1 className="app-page-title mt-4">Dashboard</h1>
          <p className="app-page-copy">
            Review recurring spend, upcoming charges, and active services in one clear view.
          </p>
        </div>
      </div>
      {/* Summary cards with landing-derived hard surfaces */}
      <div className="grid grid-cols-12 gap-5 lg:gap-7">
        {/* Monthly Spend hero card */}
        <div className="col-span-12 lg:col-span-5">
          <div className="app-panel app-panel-blue p-7 lg:p-8">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-black">
              Total Monthly Spend
            </span>
            <p className={`mt-4 font-headline text-4xl font-extrabold tracking-tight text-black lg:text-6xl ${loading ? 'animate-pulse' : ''}`}>
              {monthlySpend}
            </p>
            <div className="mt-5 flex items-center gap-2 text-black">
              <TrendingUp size={16} className="text-black" />
              <span className="text-sm font-semibold">{summary?.active_count ?? 0} active assets this cycle</span>
            </div>
          </div>
        </div>

        {/* Upcoming Payments */}
        <div className="col-span-12 lg:col-span-3">
          <div className="app-panel p-6 lg:p-8">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-black">
              Upcoming Payments
            </span>
            <p className={`mt-4 font-headline text-4xl font-bold tracking-tight text-black ${loading ? 'animate-pulse' : ''}`}>
              {upcomingTotal}
            </p>
            <p className="mt-2 text-sm text-black">
              Due in next {summary?.upcoming_window_days ?? 7} days
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="h-2 border-2 border-black bg-[#d9ff63]" />
              <div className="h-2 border-2 border-black bg-[#89ace7]" />
              <div className="h-2 border-2 border-black bg-white" />
            </div>
          </div>
        </div>

        {/* Active Assets */}
        <div className="col-span-12 lg:col-span-4">
          <div className="app-panel app-panel-lime p-6 lg:p-8">
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-black">
              Active Assets
            </span>
            <p className={`mt-4 font-headline text-4xl font-bold tracking-tight text-black ${loading ? 'animate-pulse' : ''}`}>
              {summary?.active_count ?? '--'}
            </p>
            <p className="mt-2 text-sm text-black">Subscription protocols active</p>
            <div className="mt-6 flex gap-2">
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-[10px] font-bold text-black">N</div>
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#89ace7] text-[10px] font-bold text-black">S</div>
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#fde68a] text-[10px] font-bold text-black">A</div>
              <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-[10px] font-bold text-black">
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
          className="app-button app-button-primary"
        >
          <Plus size={18} />
          Add Subscription
        </Link>
      </div>

      {/* Service cards by category */}
      <section className="space-y-8">
        {filteredSubscriptions.length === 0 ? (
          <div className="app-panel p-8 text-center">
            <p className="text-sm font-extrabold text-black">
              {searchQuery ? 'No services match your search.' : 'No services available.'}
            </p>
            <p className="mt-2 text-sm font-semibold text-black/60">
              {searchQuery ? 'Try another service, category, or domain.' : 'Add a subscription template to get started.'}
            </p>
          </div>
        ) : (
          groupedVisibleSubscriptions.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-headline text-2xl font-extrabold text-black">{group.category}</h2>
                <span className="glass-chip glass-chip-lime">{group.services.length} Services</span>
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
                      className="app-panel p-4 transition-colors duration-150 hover:bg-[#eae7e2]"
                    >
                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between">
                          {resolveLogoUrl(service.logo_url) ? (
                            <img
                              src={resolveLogoUrl(service.logo_url) || undefined}
                              alt={`${service.name} logo`}
                              className="h-9 w-9 border-2 border-black bg-white object-contain p-1.5"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center border-2 border-black bg-[#d9ff63] text-xs font-bold text-black">
                              {getInitial(service.name)}
                            </div>
                          )}
                          <span className={`glass-chip ${isExpiring ? 'expiring' : status === 'active' ? 'active' : 'inactive'}`}>
                            {isExpiring ? 'expiring' : status}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-black">{service.name}</p>
                        <p className="mt-0.5 text-xs text-black">{service.billing_cycle}</p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black">Monthly</p>
                            <p className="font-headline text-xl font-bold text-black">{formatCurrency(parseFloat(service.amount), service.currency)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-black">Next Due</p>
                            <p className={`text-sm font-bold ${isExpiring ? 'text-red-700' : 'text-black'}`}>
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
              className="app-button"
            >
              View More
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
