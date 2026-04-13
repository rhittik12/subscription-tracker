export type ServiceTemplate = {
  id: string;
  name: string;
  category: string;
  domain: string;
};

const baseTemplates: Omit<ServiceTemplate, 'id'>[] = [
  { name: 'Netflix', category: 'Entertainment', domain: 'netflix.com' },
  { name: 'Spotify', category: 'Entertainment', domain: 'spotify.com' },
  { name: 'Amazon Prime', category: 'Entertainment', domain: 'amazon.com' },
  { name: 'YouTube Premium', category: 'Entertainment', domain: 'youtube.com' },
  { name: 'Hulu', category: 'Entertainment', domain: 'hulu.com' },
];

export const defaultServiceTemplates: ServiceTemplate[] = baseTemplates.map((item, index) => ({
  ...item,
  id: `tmpl-${index + 1}`,
}));

export const SERVICE_TEMPLATES_STORAGE_KEY = 'subscription-service-templates-v1';
export const SERVICE_TEMPLATES_UPDATED_EVENT = 'service-templates-updated';

export function readServiceTemplates(): ServiceTemplate[] {
  if (typeof window === 'undefined') {
    return defaultServiceTemplates;
  }

  try {
    const raw = window.localStorage.getItem(SERVICE_TEMPLATES_STORAGE_KEY);
    if (!raw) {
      return defaultServiceTemplates;
    }

    const parsed = JSON.parse(raw) as ServiceTemplate[];
    if (!Array.isArray(parsed)) {
      return defaultServiceTemplates;
    }

    return parsed;
  } catch {
    return defaultServiceTemplates;
  }
}

export function writeServiceTemplates(templates: ServiceTemplate[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SERVICE_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  window.dispatchEvent(new Event(SERVICE_TEMPLATES_UPDATED_EVENT));
}
