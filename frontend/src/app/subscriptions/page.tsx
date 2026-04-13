'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
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

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this subscription?')) return;
    try {
      await deleteSubscription(id);
      await fetchSubscriptions();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
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
