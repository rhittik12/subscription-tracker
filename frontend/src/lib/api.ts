import axios from 'axios';
import type {
  Subscription,
  SubscriptionFormData,
  Category,
  SubscriptionTemplate,
  AnalyticsSummary,
  UserSettings,
  ExchangeRates,
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

// Subscriptions
export async function getSubscriptions(params?: {
  category?: number;
  status?: string;
  billing_cycle?: string;
  search?: string;
}): Promise<Subscription[]> {
  const { data } = await api.get('/api/subscriptions', { params });
  return data;
}

export async function getSubscription(id: number): Promise<Subscription> {
  const { data } = await api.get(`/api/subscriptions/${id}`);
  return data;
}

export async function createSubscription(sub: SubscriptionFormData): Promise<Subscription> {
  const { data } = await api.post('/api/subscriptions', sub);
  return data;
}

export async function updateSubscription(id: number, sub: SubscriptionFormData): Promise<Subscription> {
  const { data } = await api.put(`/api/subscriptions/${id}`, sub);
  return data;
}

export async function deleteSubscription(id: number): Promise<void> {
  await api.delete(`/api/subscriptions/${id}`);
}

export async function updateSubscriptionStatus(id: number, status: string): Promise<Subscription> {
  const { data } = await api.patch(`/api/subscriptions/${id}/status`, { status });
  return data;
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/api/categories');
  return data;
}

// Templates
export async function getTemplates(category?: number): Promise<SubscriptionTemplate[]> {
  const { data } = await api.get('/api/templates', { params: category ? { category } : {} });
  return data;
}

// Analytics
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await api.get('/api/analytics/summary');
  return data;
}

export async function getUpcomingRenewals(days: number = 30): Promise<Subscription[]> {
  const { data } = await api.get('/api/analytics/upcoming', { params: { days } });
  return data;
}

// Settings
export async function getSettings(): Promise<UserSettings> {
  const { data } = await api.get('/api/settings');
  return data;
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { data } = await api.put('/api/settings', settings);
  return data;
}

export async function sendTestNotification(type: 'email' | 'whatsapp'): Promise<{ message: string }> {
  const { data } = await api.post('/api/settings/test-notification', { type });
  return data;
}

// Currency
export async function getExchangeRates(): Promise<ExchangeRates> {
  const { data } = await api.get('/api/currency/rates');
  return data;
}

export default api;
