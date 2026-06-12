'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Search } from 'lucide-react';
import { Category, SubscriptionTemplate, Subscription, CURRENCIES, BILLING_CYCLES } from '@/types';
import { getTemplates } from '@/lib/api';
import { buildTemplateLogoProxyUrl, resolveLogoUrl } from '@/lib/logo';

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

const FIELD_CLASSNAME =
  'w-full border-[3px] border-black bg-white px-3 py-2.5 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/45 focus:bg-[#FDE68A] focus:shadow-brutalist-sm';
const FIELD_WITH_ICON_CLASSNAME =
  'w-full border-[3px] border-black bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-black outline-none transition-all placeholder:text-black/45 focus:bg-[#FDE68A] focus:shadow-brutalist-sm';
const LABEL_CLASSNAME =
  'mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-black';
const ERROR_CLASSNAME =
  'mt-1 border-[3px] border-black bg-[#FCA5A5] px-2 py-1 text-xs font-black uppercase text-black';
const DROPDOWN_CLASSNAME =
  'absolute z-30 mt-2 max-h-48 w-full overflow-y-auto border-[3px] border-black bg-white shadow-brutalist-sm';
const DROPDOWN_ITEM_CLASSNAME =
  'flex w-full items-center gap-3 border-b-[3px] border-black p-3 text-left text-sm font-bold text-black transition-colors last:border-b-0 hover:bg-[#d9f0c6]';

interface AddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  subscription: Subscription | null;
  initialTemplate?: SubscriptionTemplate | null;
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

  function getTemplateLogoUrl(template: SubscriptionTemplate) {
    const storedLogoUrl = resolveLogoUrl(template.logo_url);

    if (storedLogoUrl && !storedLogoUrl.includes('clearbit.com')) {
      return storedLogoUrl;
    }

    if (template.website_url) {
      try {
        const domain = new URL(template.website_url).hostname;
        return buildTemplateLogoProxyUrl(domain);
      } catch {
        return null;
      }
    }

    if (storedLogoUrl) {
      return buildTemplateLogoProxyUrl(storedLogoUrl.replace('https://logo.clearbit.com/', ''));
    }

    return null;
  }

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
      reset({
        name: initialTemplate.name,
        category_id: initialTemplate.category_id || categories[0]?.id || 1,
        category_name: initialTemplate.category_name,
        amount: 0,
        currency: initialTemplate.default_currency,
        billing_cycle: 'monthly',
        next_renewal_date: '',
        start_date: null,
        notes: null,
        logo_url: getTemplateLogoUrl(initialTemplate),
        template_id: initialTemplate.id,
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
    setValue('logo_url', getTemplateLogoUrl(template));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="brutalist-shadow relative max-h-[90vh] w-full max-w-lg overflow-y-auto border-[3px] border-black bg-[#89ACE7]">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b-[3px] border-black bg-[#FDE68A] p-5">
          <h2 className="font-headline text-xl font-bold text-black">
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border-[3px] border-black bg-white p-2 text-black transition-all hover:bg-[#FCA5A5] active:translate-x-1 active:translate-y-1"
            aria-label="Close subscription form"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="relative z-10 space-y-4 p-5">
          {!isEditing && (
            <div className="relative">
              <label className={LABEL_CLASSNAME}>Quick Add from Template</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                <input
                  type="text"
                  placeholder="Search Netflix, Spotify, Notion..."
                  value={templateSearch}
                  onChange={(e) => { setTemplateSearch(e.target.value); setShowTemplates(true); }}
                  onFocus={() => setShowTemplates(true)}
                  className={FIELD_WITH_ICON_CLASSNAME}
                />
              </div>
              {showTemplates && templateSearch && (
                <div className={DROPDOWN_CLASSNAME}>
                  {filteredTemplates.length === 0 ? (
                    <div className="p-3 text-sm font-bold text-black">No templates found</div>
                  ) : (
                    filteredTemplates.map((t) => (
                      (() => {
                        const logoUrl = getTemplateLogoUrl(t);

                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => selectTemplate(t)}
                            className={DROPDOWN_ITEM_CLASSNAME}
                          >
                            {logoUrl && (
                              <img src={logoUrl} alt={t.name} className="h-6 w-6 border-2 border-black bg-white object-contain p-0.5" />
                            )}
                            <span>{t.name}</span>
                            <span className="ml-auto text-xs">{t.category_name}</span>
                          </button>
                        );
                      })()
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <label className={LABEL_CLASSNAME}>Name *</label>
            <input
              {...register('name')}
              className={FIELD_CLASSNAME}
              placeholder="e.g. Netflix"
            />
            {errors.name && <p className={ERROR_CLASSNAME}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={LABEL_CLASSNAME}>Category *</label>
            <div className="relative">
              <input
                {...register('category_name')}
                placeholder="Type category (e.g. Entertainment)"
                onFocus={() => setShowCategorySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 120)}
                className={FIELD_CLASSNAME}
              />
              {showCategorySuggestions && categoryInput && (
                <div className={DROPDOWN_CLASSNAME}>
                  {filteredCategories.length === 0 ? (
                    <div className="p-3 text-sm font-bold text-black">No existing categories. Press save to create &quot;{categoryInput}&quot;.</div>
                  ) : (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCategory(cat)}
                        className={DROPDOWN_ITEM_CLASSNAME}
                      >
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {errors.category_name && <p className={ERROR_CLASSNAME}>{errors.category_name.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASSNAME}>Amount *</label>
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className={FIELD_CLASSNAME}
                placeholder="199.00"
              />
              {errors.amount && <p className={ERROR_CLASSNAME}>{errors.amount.message}</p>}
            </div>
            <div>
              <label className={LABEL_CLASSNAME}>Currency</label>
              <select
                {...register('currency')}
                className={FIELD_CLASSNAME}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASSNAME}>Billing Cycle *</label>
            <select
              {...register('billing_cycle')}
              className={FIELD_CLASSNAME}
            >
              {BILLING_CYCLES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL_CLASSNAME}>Next Renewal Date *</label>
            <input
              type="date"
              {...register('next_renewal_date')}
              className={`${FIELD_CLASSNAME} [color-scheme:light]`}
            />
            {errors.next_renewal_date && <p className={ERROR_CLASSNAME}>{errors.next_renewal_date.message}</p>}
          </div>

          <div>
            <label className={LABEL_CLASSNAME}>Start Date (optional)</label>
            <input
              type="date"
              {...register('start_date')}
              className={`${FIELD_CLASSNAME} [color-scheme:light]`}
            />
          </div>

          <div>
            <label className={LABEL_CLASSNAME}>Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className={`${FIELD_CLASSNAME} resize-none`}
              placeholder="Family plan, shared with..."
            />
          </div>

          <div className="flex flex-col justify-end gap-3 border-t-[3px] border-black pt-5 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="border-[3px] border-black bg-white px-4 py-2.5 text-sm font-black uppercase text-black transition-all hover:bg-[#FCA5A5] active:translate-x-1 active:translate-y-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="border-[3px] border-black bg-[#d9f0c6] px-5 py-2.5 text-sm font-black uppercase text-black shadow-brutalist-sm transition-all hover:bg-[#b8e986] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
