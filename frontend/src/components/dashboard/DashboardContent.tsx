'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary } from '@/lib/api';
import { AnalyticsSummary } from '@/types';
import { Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import {
  defaultServiceTemplates,
  readServiceTemplates,
  ServiceTemplate,
  SERVICE_TEMPLATES_UPDATED_EVENT,
} from '@/lib/serviceTemplates';

const categoryOrder = [
  'Entertainment',
  'Productivity',
  'Utilities & Storage',
  'Food & Lifestyle',
  'News & Reading',
  'Gaming',
];

function getAssumedDueDate(index: number): string {
  const today = new Date();
  const offsetDays = (index % 28) + 2;
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + offsetDays);
  return dueDate.toISOString();
}

function getAssumedPlan(index: number): string {
  const plans = ['Individual', 'Family Plan', 'Standard', 'Pro', 'Premium'];
  return plans[index % plans.length];
}

function getAssumedAmount(index: number): string {
  const prices = ['19.99', '16.99', '13.99', '99.00', '7.25', '54.99', '11.99', '120.00'];
  return prices[index % prices.length];
}

function getAssumedStatus(index: number): 'active' | 'expiring' | 'paused' {
  const statuses: Array<'active' | 'expiring' | 'paused'> = ['active', 'active', 'expiring', 'paused'];
  return statuses[index % statuses.length];
}

function formatCardDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

export function DashboardContent() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [services, setServices] = useState<ServiceTemplate[]>(defaultServiceTemplates);
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
    const refresh = () => {
      setServices(readServiceTemplates());
    };

    refresh();
    window.addEventListener(SERVICE_TEMPLATES_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(SERVICE_TEMPLATES_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const monthlySpend = summary
    ? formatCurrency(summary.total_monthly, summary.currency)
    : '--';
  const upcomingTotal = summary
    ? formatCurrency(summary.renewing_this_week > 0 ? summary.total_monthly * 0.32 : 0, summary.currency)
    : '--';
  const filteredServices = useMemo(() => {
    if (!searchQuery) {
      return services;
    }

    return services.filter((service) => {
      const haystacks = [service.name, service.category, service.domain].map((value) => value.toLowerCase());
      return haystacks.some((value) => value.includes(searchQuery));
    });
  }, [searchQuery, services]);

  const visibleServices = useMemo(() => filteredServices.slice(0, visibleCount), [filteredServices, visibleCount]);
  const canViewMore = visibleCount < filteredServices.length;

  const serviceIndexMap = useMemo(() => {
    const indexMap = new Map<string, number>();
    services.forEach((service, index) => {
      indexMap.set(service.id, index);
    });
    return indexMap;
  }, [services]);

  useEffect(() => {
    setVisibleCount((prev) => Math.min(prev, Math.max(services.length, 5)));
  }, [services.length]);

  const groupedVisibleServices = useMemo(
    () =>
      categoryOrder
        .map((category) => ({
          category,
          services: visibleServices.filter((service) => service.category === category),
        }))
        .filter((group) => group.services.length > 0),
    [visibleServices]
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
        {filteredServices.length === 0 ? (
          <div className="glass-card glass-reflection rounded-2xl p-8 text-center">
            <p className="text-sm font-semibold text-white/80">
              {searchQuery ? 'No services match your search.' : 'No services available.'}
            </p>
            <p className="mt-2 text-sm text-white/35">
              {searchQuery ? 'Try another service, category, or domain.' : 'Add a subscription template to get started.'}
            </p>
          </div>
        ) : (
          groupedVisibleServices.map((group) => (
            <div key={group.category}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="font-headline text-lg font-extrabold text-white/85">{group.category}</h2>
                <span className="text-xs font-semibold text-white/25">{group.services.length} Services</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {group.services.map((service) => {
                  const globalIndex = serviceIndexMap.get(service.id) ?? 0;
                  const dueDate = getAssumedDueDate(globalIndex);
                  const status = getAssumedStatus(globalIndex);
                  const statusClasses =
                    status === 'active'
                      ? 'glass-chip text-emerald-400'
                      : status === 'expiring'
                      ? 'glass-chip text-amber-400'
                      : 'glass-chip text-white/30';

                  return (
                    <div
                      key={`${service.category}-${service.name}`}
                      className="glass-card glass-reflection rounded-2xl p-4"
                    >
                      <div className="relative z-10">
                        <div className="mb-4 flex items-start justify-between">
                          <img
                            src={`https://logo.clearbit.com/${service.domain}`}
                            alt={`${service.name} logo`}
                            className="h-9 w-9 rounded-lg bg-white/10 object-contain p-1.5"
                            loading="lazy"
                            decoding="async"
                          />
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${statusClasses}`}>
                            {status}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-white/90">{service.name}</p>
                        <p className="mt-0.5 text-xs text-white/30">{getAssumedPlan(globalIndex)}</p>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">Monthly</p>
                            <p className="font-headline text-xl font-bold text-white/90">${getAssumedAmount(globalIndex)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/25">Next Due</p>
                            <p className={`text-sm font-bold ${status === 'expiring' ? 'text-rose-400' : 'text-white/70'}`}>
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
              onClick={() => setVisibleCount((prev) => Math.min(prev + 5, filteredServices.length))}
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
