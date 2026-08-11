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
      color: 'text-black',
      bg: 'bg-[#d9ff63]',
    },
    {
      title: 'Yearly Spend',
      value: summary ? formatCurrency(summary.total_yearly, summary.currency) : '--',
      icon: Calendar,
      color: 'text-black',
      bg: 'bg-[#89ace7]',
    },
    {
      title: 'Active Subscriptions',
      value: summary ? summary.active_count.toString() : '--',
      icon: CreditCard,
      color: 'text-black',
      bg: 'bg-[#fde68a]',
    },
    {
      title: 'Renewing This Week',
      value: summary ? summary.renewing_this_week.toString() : '--',
      icon: AlertTriangle,
      color: 'text-black',
      bg: 'bg-[#fca5a5]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="app-panel p-5 transition-colors hover:bg-[#eae7e2]"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold uppercase text-black">{card.title}</p>
            <div className={`border-2 border-black p-2 ${card.bg}`}>
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
