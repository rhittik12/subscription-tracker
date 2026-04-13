'use client';

import { formatCurrency } from '@/lib/utils';
import { AnalyticsSummary } from '@/types';
import {
  IndianRupee,
  Calendar,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

interface SummaryCardsProps {
  summary: AnalyticsSummary | null;
  loading: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Monthly Spend',
      value: summary ? formatCurrency(summary.total_monthly, summary.currency) : '--',
      icon: IndianRupee,
      color: 'text-white',
      bg: 'bg-white/10',
    },
    {
      title: 'Yearly Spend',
      value: summary ? formatCurrency(summary.total_yearly, summary.currency) : '--',
      icon: Calendar,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Active Subscriptions',
      value: summary ? summary.active_count.toString() : '--',
      icon: CreditCard,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Renewing This Week',
      value: summary ? summary.renewing_this_week.toString() : '--',
      icon: AlertTriangle,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon size={18} className={card.color} />
            </div>
          </div>
          <p className={`mt-3 text-2xl font-bold ${loading ? 'animate-pulse' : ''}`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
