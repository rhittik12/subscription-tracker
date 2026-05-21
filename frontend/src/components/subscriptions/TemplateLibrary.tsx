'use client';

import { useEffect, useState } from 'react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { SubscriptionTemplate } from '@/types';
import { deleteTemplate, getTemplates } from '@/lib/api';

interface TemplateLibraryProps {
  onEditTemplate: (template: SubscriptionTemplate) => void;
}

export function TemplateLibrary({ onEditTemplate }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([]);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    async function refresh() {
      try {
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      }
    }

    refresh();
  }, []);

  async function handleDelete(id: number) {
    try {
      await deleteTemplate(id);
      setTemplates((current) => current.filter((template) => template.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
    setOpenMenuId(null);
  }

  function handleEdit(id: number) {
    const current = templates.find((template) => template.id === id);
    if (!current) return;

    onEditTemplate(current);
    setOpenMenuId(null);
  }

  function getTemplateLogo(template: SubscriptionTemplate) {
    if (template.logo_url) return template.logo_url;

    if (template.website_url) {
      try {
        return `https://logo.clearbit.com/${new URL(template.website_url).hostname}`;
      } catch {
        return null;
      }
    }

    return null;
  }

  function getInitial(name: string) {
    return name.trim().charAt(0).toUpperCase();
  }

  return (
    <section className="glass-card glass-reflection rounded-2xl p-5">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold text-white/85">App Templates</h2>
          <p className="text-xs font-semibold text-white/25">{templates.length} Apps</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="relative flex items-center justify-between rounded-xl glass-chip p-2.5 transition-all duration-300"
            >
              <div className="flex min-w-0 items-center gap-2">
                {getTemplateLogo(template) ? (
                  <img
                    src={getTemplateLogo(template) || undefined}
                    alt={`${template.name} logo`}
                    className="h-7 w-7 rounded-lg bg-white/10 object-contain p-1"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-[10px] font-bold text-white/70">
                    {getInitial(template.name)}
                  </div>
                )}
                <span className="truncate text-xs font-semibold text-white/75">{template.name}</span>
              </div>

              <button
                type="button"
                className="rounded-lg p-1 text-white/25 hover:bg-white/[0.06] hover:text-white/50 transition-all duration-200"
                onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
              >
                <MoreHorizontal size={14} />
              </button>

              {openMenuId === template.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute right-1 top-15 z-20 w-28 rounded-xl glass-heavy py-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 px-2.5 py-2 text-xs text-white/70 hover:bg-white/[0.06] transition-colors"
                      onClick={() => handleEdit(template.id)}
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
