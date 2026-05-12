'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Subscription, Category, SubscriptionFormData } from '@/types';
import {
  getSubscriptions,
  getCategories,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
} from '@/lib/api';
import { ServiceTemplate } from '@/lib/serviceTemplates';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';
import { AddEditModal } from '@/components/subscriptions/AddEditModal';
import { TemplateLibrary } from '@/components/subscriptions/TemplateLibrary';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    }
    init();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  async function handleSubmit(data: SubscriptionFormData) {
    try {
      if (editingSub) {
        await updateSubscription(editingSub.id, data);
      } else {
        await createSubscription(data);
      }
      setModalOpen(false);
      setEditingSub(null);
      setSelectedTemplate(null);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  }

  function handleDelete(id: number) {
    const sub = subscriptions.find((item) => item.id === id);
    if (sub) {
      setDeleteError(null);
      setPendingDelete(sub);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const subscriptionToDelete = pendingDelete;

    try {
      setDeleteError(null);
      setDeletingId(subscriptionToDelete.id);
      await deleteSubscription(subscriptionToDelete.id);
      setSubscriptions((current) => current.filter((sub) => sub.id !== subscriptionToDelete.id));
      setPendingDelete(null);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      setDeleteError('Could not delete this subscription. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(id: number, status: string) {
    try {
      await updateSubscriptionStatus(id, status);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  function handleEdit(sub: Subscription) {
    setSelectedTemplate(null);
    setEditingSub(sub);
    setModalOpen(true);
  }

  function handleEditTemplate(template: ServiceTemplate) {
    setEditingSub(null);
    setSelectedTemplate(template);
    setModalOpen(true);
  }

  function handleAddNew() {
    setEditingSub(null);
    setSelectedTemplate(null);
    setModalOpen(true);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white/95 lg:text-4xl">
            Subscriptions
          </h1>
          <p className="mt-2 text-sm font-medium text-white/40">
            Manage all your subscriptions ({subscriptions.length} total)
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="glass-btn inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      <SubscriptionTable
        subscriptions={subscriptions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      <TemplateLibrary onEditTemplate={handleEditTemplate} />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => {
              if (deletingId !== pendingDelete.id) setPendingDelete(null);
            }}
          />
          <div className="glass-card relative w-full max-w-sm rounded-3xl p-5">
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-rose-500/15 p-2.5 text-rose-400 ring-1 ring-rose-500/20">
                  <Trash2 size={18} />
                </div>
                <div>
                  <h2 className="font-headline text-lg font-bold text-white/90">Delete subscription?</h2>
                  <p className="mt-1 text-sm text-white/40">{pendingDelete.name}</p>
                </div>
              </div>

              <p className="text-sm text-white/55">
                This will remove the subscription from your tracker.
              </p>
              {deleteError && (
                <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  {deleteError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setPendingDelete(null);
                  }}
                  disabled={deletingId === pendingDelete.id}
                  className="glass-chip rounded-xl px-4 py-2.5 text-sm font-semibold text-white/55 transition-colors hover:text-white/80 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingId === pendingDelete.id}
                  className="rounded-xl bg-rose-500/90 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:opacity-50"
                >
                  {deletingId === pendingDelete.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddEditModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSub(null);
          setSelectedTemplate(null);
        }}
        onSubmit={handleSubmit}
        subscription={editingSub}
        initialTemplate={selectedTemplate}
        categories={categories}
      />
    </div>
  );
}
