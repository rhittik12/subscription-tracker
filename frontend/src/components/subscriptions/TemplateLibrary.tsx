'use client';

import { useEffect, useState } from 'react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { SubscriptionTemplate } from '@/types';
import { deleteTemplate, getTemplates } from '@/lib/api';
import { buildTemplateLogoProxyUrl, resolveLogoUrl } from '@/lib/logo';

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
    const storedLogoUrl = resolveLogoUrl(template.logo_url);

    if (storedLogoUrl) return storedLogoUrl;

    if (template.website_url) {
      try {
        return buildTemplateLogoProxyUrl(new URL(template.website_url).hostname);
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
    <section className="app-panel app-panel-amber p-5">
      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-headline text-2xl font-extrabold text-black">App Templates</h2>
          <p className="glass-chip bg-white">{templates.length} Apps</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="relative flex items-center justify-between border-2 border-black bg-white p-2.5 transition-colors duration-150 hover:bg-[#d9ff63]"
            >
              <div className="flex min-w-0 items-center gap-2">
                {getTemplateLogo(template) ? (
                  <img
                    src={getTemplateLogo(template) || undefined}
                    alt={`${template.name} logo`}
                    className="h-7 w-7 border-2 border-black bg-white object-contain p-1"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center border-2 border-black bg-[#d9ff63] text-[10px] font-bold text-black">
                    {getInitial(template.name)}
                  </div>
                )}
                <span className="truncate text-xs font-extrabold text-black">{template.name}</span>
              </div>

              <button
                type="button"
                className="border-2 border-transparent p-1 text-black transition-colors duration-150 hover:border-black hover:bg-white"
                onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
              >
                <MoreHorizontal size={14} />
              </button>

              {openMenuId === template.id && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute right-1 top-10 z-20 w-32 border-2 border-black bg-white py-1 shadow-[4px_4px_0_#111]">
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 px-2.5 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-[#d9ff63]"
                      onClick={() => handleEdit(template.id)}
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-1.5 px-2.5 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-[#fca5a5]"
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
