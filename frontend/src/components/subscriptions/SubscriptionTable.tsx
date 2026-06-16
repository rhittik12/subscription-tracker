'use client';

import { useEffect, useState } from 'react';
import { Subscription } from '@/types';
import { formatCurrency, formatDate, getDaysUntil, getBillingCycleLabel } from '@/lib/utils';
import { resolveLogoUrl } from '@/lib/logo';
import {
  Pause,
  Play,
  Trash2,
  Edit,
} from 'lucide-react';

type SubscriptionStatus = Subscription['status'];

const TABLE_HEADERS = [
  'Service',
  'Category',
  'Amount',
  'Cycle',
  'Next Renewal',
  'Status',
  'Actions',
] as const;

const HEADER_CLASSNAME = 'border-r-[3px] border-black px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.14em] text-black last:border-r-0';

function getStatusBadgeClass(status: SubscriptionStatus): string {
  if (status === 'active') return 'border-[3px] border-black bg-[#d9f0c6] text-black';
  if (status === 'paused') return 'border-[3px] border-black bg-[#FDE68A] text-black';
  return 'border-[3px] border-black bg-[#FCA5A5] text-black';
}

function getStatusLabel(status: SubscriptionStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  loading?: boolean;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, status: string) => void;
}

export function SubscriptionTable({
  subscriptions,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}: SubscriptionTableProps) {
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  useEffect(() => {
    if (openMenu === null) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [openMenu]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="glass-card rounded-2xl px-6 py-10 text-center" role="status" aria-live="polite">
          <p className="text-sm font-medium text-black">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="border-[3px] border-black bg-white brutalist-shadow overflow-hidden">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full min-w-[900px] border-collapse lg:min-w-0" aria-label="Subscriptions table">
              <thead className="bg-[#89ACE7]">
                <tr className="border-b-[3px] border-black">
                  {TABLE_HEADERS.map((header) => (
                    <th
                      key={header}
                      className={`${HEADER_CLASSNAME} ${header === 'Actions' ? 'text-right' : ''}`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-[3px] divide-black">
                {subscriptions.map((sub) => {
                  const daysUntil = getDaysUntil(sub.next_renewal_date);
                  const amount = Number(sub.amount);

                  return (
                    <tr key={sub.id} className="bg-white transition-colors duration-200 hover:bg-[#d9f0c6]">
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        <div className="flex items-center gap-3">
                          {resolveLogoUrl(sub.logo_url) ? (
                            <img
                              src={resolveLogoUrl(sub.logo_url) || undefined}
                              alt={sub.name}
                              className="h-8 w-8 rounded-xl object-contain bg-white/10 p-1"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-black ring-1 ring-black/10"
                              style={{ backgroundColor: `${sub.category_color}30` }}
                            >
                              {getInitial(sub.name)}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-black">{sub.name}</span>
                        </div>
                      </td>
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: `${sub.category_color}18`,
                            color: sub.category_color,
                          }}
                        >
                          {sub.category_name}
                        </span>
                      </td>
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        {formatCurrency(Number.isFinite(amount) ? amount : 0, sub.currency)}
                      </td>
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        {getBillingCycleLabel(sub.billing_cycle)}
                      </td>
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        <div className="text-sm text-black">{formatDate(sub.next_renewal_date)}</div>
                        {sub.status === 'active' && (
                          <div className={`mt-0.5 text-xs ${daysUntil <= 7 ? 'text-black' : 'text-black'}`}>
                            {daysUntil <= 0 ? 'Due today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                          </div>
                        )}
                      </td>
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        <span className={`text-xs font-black uppercase px-2.5 py-1 ${getStatusBadgeClass(sub.status)}`}>
                          {getStatusLabel(sub.status)}
                        </span>
                      </td>
                      <td className="border-r-[3px] border-black px-4 py-3 last:border-r-0">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(sub)}
                            className="border-[2px] border-black p-2 hover:bg-[#89ACE7]"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onToggleStatus(
                                sub.id,
                                sub.status === 'active' ? 'paused' : 'active'
                              )
                            }
                            className="border-[2px] border-black p-2 hover:bg-[#89ACE7]"
                          >
                            {sub.status === 'active' ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(sub.id)}
                            className="border-[2px] border-black p-2 hover:bg-red-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl px-6 py-10 text-center">
          <p className="text-sm font-semibold text-black">No subscriptions found.</p>
          <p className="mt-2 text-sm text-black">Add a subscription to get started.</p>
        </div>
      )}
    </div>
  );
}
