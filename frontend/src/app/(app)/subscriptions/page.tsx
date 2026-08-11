'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Subscription, Category, SubscriptionFormData, SubscriptionTemplate } from '@/types';
import {
  getSubscriptions,
  getCategories,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  updateSubscriptionStatus,
} from '@/lib/api';
import { SubscriptionTable } from '@/components/subscriptions/SubscriptionTable';
import { AddEditModal } from '@/components/subscriptions/AddEditModal';
import { TemplateLibrary } from '@/components/subscriptions/TemplateLibrary';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<SubscriptionTemplate | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Subscription | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setSubscriptions(await getSubscriptions());
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories().then(setCategories).catch((error) => console.error('Failed to fetch categories:', error));
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  async function handleSubmit(data: SubscriptionFormData) {
    try {
      if (editingSub) await updateSubscription(editingSub.id, data);
      else await createSubscription(data);
      setModalOpen(false);
      setEditingSub(null);
      setSelectedTemplate(null);
      await fetchSubscriptions();
      window.dispatchEvent(new Event('subscriptions-updated'));
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      setDeletingId(pendingDelete.id);
      await deleteSubscription(pendingDelete.id);
      setPendingDelete(null);
      await fetchSubscriptions();
      window.dispatchEvent(new Event('subscriptions-updated'));
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      setDeleteError('Could not delete this subscription. Please try again.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(id: number, status: string) {
    await updateSubscriptionStatus(id, status);
    await fetchSubscriptions();
    window.dispatchEvent(new Event('subscriptions-updated'));
  }

  return (
    <div className="app-page">
      <div className="app-page-header">
        <div>
          <span className="app-kicker">{subscriptions.length} Total</span>
          <h1 className="app-page-title mt-4">Subscriptions</h1>
          <p className="app-page-copy">Manage services, renewal dates, costs, and saved templates.</p>
        </div>
        <button onClick={() => { setEditingSub(null); setSelectedTemplate(null); setModalOpen(true); }} className="app-button app-button-primary mobile-full-button w-full sm:w-auto">
          <Plus size={18} /> Add New
        </button>
      </div>

      <SubscriptionTable
        subscriptions={subscriptions}
        loading={loading}
        onEdit={(sub) => { setSelectedTemplate(null); setEditingSub(sub); setModalOpen(true); }}
        onDelete={(id) => { setDeleteError(null); setPendingDelete(subscriptions.find((item) => item.id === id) ?? null); }}
        onToggleStatus={handleToggleStatus}
      />
      <TemplateLibrary onEditTemplate={(template) => { setEditingSub(null); setSelectedTemplate(template); setModalOpen(true); }} />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button className="fixed inset-0 bg-black/60" aria-label="Close" onClick={() => setPendingDelete(null)} />
          <div className="app-panel relative w-full max-w-sm bg-[#fcfaf7] p-5">
            <div className="mb-4 flex items-center gap-3"><Trash2 size={18} /><h2 className="font-headline text-lg font-bold">Delete {pendingDelete.name}?</h2></div>
            <p>This will remove the subscription from your tracker.</p>
            {deleteError && <p className="mt-3 text-red-700">{deleteError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button className="app-button px-4 py-2.5" onClick={() => setPendingDelete(null)}>Cancel</button>
              <button className="app-button app-button-danger px-4 py-2.5" onClick={confirmDelete} disabled={deletingId === pendingDelete.id}>
                {deletingId === pendingDelete.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      <AddEditModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSub(null); setSelectedTemplate(null); }}
        onSubmit={handleSubmit}
        subscription={editingSub}
        initialTemplate={selectedTemplate}
        categories={categories}
      />
    </div>
  );
}
