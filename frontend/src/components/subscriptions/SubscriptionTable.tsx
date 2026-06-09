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
            <table className="w-full border-collapse" aria-label="Subscriptions table">
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
                  const isMenuOpen = openMenu === sub.id;
                  const nextStatus: SubscriptionStatus = sub.status === 'active' ? 'paused' : 'active';

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
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setOpenMenu(openMenu === sub.id ? null : sub.id)}
                            className="border-[3px] border-black bg-white p-1.5 text-black transition-all duration-200 hover:bg-[#89ACE7]"
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
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-black hover:bg-white/[0.06] hover:text-white/90 transition-colors"
                                  role="menuitem"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { onToggleStatus(sub.id, nextStatus); setOpenMenu(null); }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-black hover:bg-white/[0.06] hover:text-white/90 transition-colors"
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
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-black hover:bg-rose-500/10 transition-colors"
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
          <p className="text-sm font-semibold text-black">No subscriptions found.</p>
          <p className="mt-2 text-sm text-black">Add a subscription to get started.</p>
        </div>
      )}
    </div>
  );
}
