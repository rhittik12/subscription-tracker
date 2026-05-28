const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function buildTemplateLogoProxyUrl(domain: string): string {
  return new URL(
    `/api/templates/logo/proxy?domain=${encodeURIComponent(domain)}`,
    API_BASE_URL
  ).toString();
}

export function resolveLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) {
    return null;
  }

  if (logoUrl.startsWith('/api/templates/logo/proxy')) {
    return new URL(logoUrl, API_BASE_URL).toString();
  }

  if (logoUrl.includes('logo.clearbit.com/')) {
    const domain = logoUrl.split('logo.clearbit.com/')[1]?.trim();
    if (domain) {
      return buildTemplateLogoProxyUrl(domain);
    }
  }

  return logoUrl;
}