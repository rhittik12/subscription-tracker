'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Search } from 'lucide-react';
import { Category, SubscriptionTemplate, Subscription, CURRENCIES, BILLING_CYCLES } from '@/types';
import { getTemplates } from '@/lib/api';
import { ServiceTemplate } from '@/lib/serviceTemplates';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category_id: z.number().int().positive().optional().nullable(),
  category_name: z.string().trim().min(1, 'Category is required').max(50),
  amount: z.number({ required_error: 'Amount is required' }).positive('Amount must be positive'),
  currency: z.string().length(3),
  billing_cycle: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  next_renewal_date: z.string().min(1, 'Renewal date is required'),
  start_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  template_id: z.number().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  subscription: Subscription | null;
  initialTemplate?: ServiceTemplate | null;
  categories: Category[];
}

export function AddEditModal({
  isOpen,
  onClose,
  onSubmit,
  subscription,
  initialTemplate = null,
  categories,
}: AddEditModalProps) {
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const isEditing = !!subscription;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      category_id: categories[0]?.id || null,
      category_name: categories[0]?.name || '',
      amount: 0,
      currency: 'INR',
      billing_cycle: 'monthly',
      next_renewal_date: '',
      start_date: null,
      notes: null,
      logo_url: null,
      template_id: null,
    },
  });

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    }
    if (isOpen) fetchTemplates();
  }, [isOpen]);

  useEffect(() => {
    if (subscription) {
      reset({
        name: subscription.name,
        category_id: subscription.category_id,
        category_name: subscription.category_name,
        amount: parseFloat(subscription.amount),
        currency: subscription.currency,
        billing_cycle: subscription.billing_cycle,
        next_renewal_date: subscription.next_renewal_date.split('T')[0],
        start_date: subscription.start_date?.split('T')[0] || null,
        notes: subscription.notes,
        logo_url: subscription.logo_url,
        template_id: subscription.template_id,
      });
    } else if (initialTemplate) {
      const matchedCategoryId = categories.find(
        (category) => category.name.toLowerCase() === initialTemplate.category.toLowerCase()
      )?.id;

      reset({
        name: initialTemplate.name,
        category_id: matchedCategoryId || categories[0]?.id || 1,
        category_name: initialTemplate.category,
        amount: 0,
        currency: 'INR',
        billing_cycle: 'monthly',
        next_renewal_date: '',
        start_date: null,
        notes: null,
        logo_url: `https://logo.clearbit.com/${initialTemplate.domain}`,
        template_id: null,
      });
    } else {
      reset({
        name: '',
        category_id: categories[0]?.id || null,
        category_name: categories[0]?.name || '',
        amount: 0,
        currency: 'INR',
        billing_cycle: 'monthly',
        next_renewal_date: '',
        start_date: null,
        notes: null,
        logo_url: null,
        template_id: null,
      });
    }
  }, [subscription, initialTemplate, isOpen, categories, reset]);

  function selectTemplate(template: SubscriptionTemplate) {
    setValue('name', template.name);
    setValue('category_id', template.category_id);
    setValue('category_name', template.category_name);
    setValue('currency', template.default_currency);
    setValue('logo_url', template.logo_url);
    setValue('template_id', template.id);
    setTemplateSearch('');
    setShowTemplates(false);
  }

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const categoryInput = watch('category_name') || '';
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryInput.toLowerCase())
  );

  function selectCategory(category: Category) {
    setValue('category_name', category.name, { shouldValidate: true });
    setValue('category_id', category.id);
    setShowCategorySuggestions(false);
  }

  function handleFormSubmit(data: FormData) {
    const trimmedCategory = data.category_name.trim();
    const matchedCategory = categories.find(
      (category) => category.name.toLowerCase() === trimmedCategory.toLowerCase()
    );

    onSubmit({
      ...data,
      category_name: trimmedCategory,
      category_id: matchedCategory?.id ?? null,
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with heavier blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal — heavy glass */}
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl glass-heavy">
        {/* Inner light reflection */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] to-transparent pointer-events-none z-0" />

        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between rounded-t-3xl p-5 border-b border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
          <h2 className="font-headline text-xl font-bold text-white/90">
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-all duration-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="relative z-10 space-y-4 p-5">
          {/* Template search */}
          {!isEditing && (
            <div className="relative">
              <label className="mb-1.5 block text-sm font-semibold text-white/60">Quick Add from Template</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  type="text"
                  placeholder="Search Netflix, Spotify, Notion..."
                  value={templateSearch}
                  onChange={(e) => { setTemplateSearch(e.target.value); setShowTemplates(true); }}
                  onFocus={() => setShowTemplates(true)}
                  className="glass-input w-full rounded-xl pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
              {showTemplates && templateSearch && (
                <div className="absolute z-30 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl glass-heavy">
                  {filteredTemplates.length === 0 ? (
                    <div className="p-3 text-sm text-white/30">No templates found</div>
                  ) : (
                    filteredTemplates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => selectTemplate(t)}
                        className="flex w-full items-center gap-3 p-3 text-left text-sm hover:bg-white/[0.06] transition-colors"
                      >
                        {t.logo_url && (
                          <img src={t.logo_url} alt={t.name} className="h-6 w-6 rounded-lg object-contain bg-white/10 p-0.5" />
                        )}
                        <span className="text-white/80">{t.name}</span>
                        <span className="ml-auto text-xs text-white/30">{t.category_name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/60">Name *</label>
            <input
              {...register('name')}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
              placeholder="e.g. Netflix"
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/60">Category *</label>
            <div className="relative">
              <input
                {...register('category_name')}
                placeholder="Type category (e.g. Entertainment)"
                onFocus={() => setShowCategorySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 120)}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
              />
              {showCategorySuggestions && categoryInput && (
                <div className="absolute z-30 mt-1 max-h-44 w-full overflow-y-auto rounded-2xl glass-heavy">
                  {filteredCategories.length === 0 ? (
                    <div className="p-3 text-sm text-white/30">No existing categories. Press save to create &quot;{categoryInput}&quot;.</div>
                  ) : (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCategory(cat)}
                        className="block w-full px-3 py-2.5 text-left text-sm text-white/75 transition-colors hover:bg-white/[0.06]"
                      >
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.category_name && <p className="mt-1 text-xs text-rose-400">{errors.category_name.message}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/60">Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
                placeholder="199.00"
              />
              {errors.amount && <p className="text-xs text-rose-400 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-white/60">Currency</label>
              <select
                {...register('currency')}
                className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0f1223] text-white">{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Billing Cycle */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/60">Billing Cycle *</label>
            <select
              {...register('billing_cycle')}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
            >
              {BILLING_CYCLES.map((c) => (
                <option key={c.value} value={c.value} className="bg-[#0f1223] text-white">{c.label}</option>
              ))}
            </select>
          </div>

          {/* Next Renewal Date */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/60">Next Renewal Date *</label>
            <input
              type="date"
              {...register('next_renewal_date')}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm [color-scheme:dark]"
            />
            {errors.next_renewal_date && <p className="text-xs text-rose-400 mt-1">{errors.next_renewal_date.message}</p>}
          </div>

          {/* Start Date */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/60">Start Date (optional)</label>
            <input
              type="date"
              {...register('start_date')}
              className="glass-input w-full rounded-xl px-3 py-2.5 text-sm [color-scheme:dark]"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/60">Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="glass-input w-full resize-none rounded-xl px-3 py-2.5 text-sm"
              placeholder="Family plan, shared with..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="glass-chip rounded-xl px-4 py-2.5 text-sm font-semibold text-white/50 transition-all duration-300 hover:text-white/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="glass-btn rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
