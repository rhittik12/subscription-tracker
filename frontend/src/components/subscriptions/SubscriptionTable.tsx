'use client';

import { useEffect, useState } from 'react';
import { Subscription } from '@/types';
import { formatCurrency, formatDate, getDaysUntil, getBillingCycleLabel } from '@/lib/utils';
import {
  Pause,
  Play,
  Trash2,
  Edit,
  MoreHorizontal,
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

const HEADER_CLASSNAME = 'px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-white/25';

function getStatusBadgeClass(status: SubscriptionStatus): string {
  if (status === 'active') return 'bg-emerald-500/15 text-emerald-400';
  if (status === 'paused') return 'bg-amber-500/15 text-amber-400';
  return 'bg-rose-500/15 text-rose-400';
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
  loading = false,
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
          <p className="text-sm font-medium text-white/40">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length > 0 ? (
        <div className="glass-card glass-reflection rounded-2xl overflow-hidden">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full" aria-label="Subscriptions table">
              <thead>
                <tr className="border-b border-white/[0.06]">
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
              <tbody className="divide-y divide-white/[0.04]">
                {subscriptions.map((sub) => {
                  const daysUntil = getDaysUntil(sub.next_renewal_date);
                  const amount = Number(sub.amount);
                  const isMenuOpen = openMenu === sub.id;
                  const nextStatus: SubscriptionStatus = sub.status === 'active' ? 'paused' : 'active';

                  return (
                    <tr key={sub.id} className="transition-colors duration-200 hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {sub.logo_url ? (
                            <img
                              src={sub.logo_url}
                              alt={sub.name}
                              className="h-8 w-8 rounded-xl object-contain bg-white/10 p-1"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white ring-1 ring-white/10"
                              style={{ backgroundColor: `${sub.category_color}30` }}
                            >
                              {getInitial(sub.name)}
                            </div>
                          )}
                          <span className="text-sm font-semibold text-white/85">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
                      <td className="px-4 py-3 font-headline text-sm font-bold text-white/85">
                        {formatCurrency(Number.isFinite(amount) ? amount : 0, sub.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/40">
                        {getBillingCycleLabel(sub.billing_cycle)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white/70">{formatDate(sub.next_renewal_date)}</div>
                        {sub.status === 'active' && (
                          <div className={`mt-0.5 text-xs ${daysUntil <= 7 ? 'text-amber-400' : 'text-white/30'}`}>
                            {daysUntil <= 0 ? 'Due today' : `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadgeClass(sub.status)}`}>
                          {getStatusLabel(sub.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenMenu(openMenu === sub.id ? null : sub.id)}
                            className="rounded-xl p-1.5 text-white/30 transition-all duration-200 hover:bg-white/[0.06] hover:text-white/60"
                            aria-label={`Open actions for ${sub.name}`}
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {isMenuOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                              <div
                                className="absolute right-0 top-full z-20 mt-3 w-40 rounded-2xl glass-heavy py-1"
                                role="menu"
                                aria-label={`${sub.name} actions`}
                              >
                                <button
                                  type="button"
                                  onClick={() => { onEdit(sub); setOpenMenu(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                                  role="menuitem"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { onToggleStatus(sub.id, nextStatus); setOpenMenu(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                                  role="menuitem"
                                >
                                  {sub.status === 'active' ? (
                                    <><Pause size={14} /> Pause</>
                                  ) : (
                                    <><Play size={14} /> Resume</>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { onDelete(sub.id); setOpenMenu(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  role="menuitem"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
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
          <p className="text-sm font-semibold text-white/80">No subscriptions found.</p>
          <p className="mt-2 text-sm text-white/35">Add a subscription to get started.</p>
        </div>
      )}
    </div>
  );
}
