export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface SubscriptionTemplate {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  default_currency: string;
  logo_url: string | null;
  website_url: string | null;
}

export interface Subscription {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  amount: string;
  currency: string;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_renewal_date: string;
  start_date: string | null;
  status: 'active' | 'paused' | 'cancelled';
  notes: string | null;
  logo_url: string | null;
  template_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionFormData {
  name: string;
  category_id?: number | null;
  category_name: string;
  amount: number;
  currency: string;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_renewal_date: string;
  start_date?: string | null;
  status?: 'active' | 'paused' | 'cancelled';
  notes?: string | null;
  logo_url?: string | null;
  template_id?: number | null;
}

export interface UserSettings {
  id: number;
  preferred_currency: string;
  email: string;
  whatsapp_number: string;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  reminder_days_before: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_monthly: number;
  total_yearly: number;
  active_count: number;
  renewing_this_week: number;
  currency: string;
  category_breakdown: {
    name: string;
    amount: number;
  }[];
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
}

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];
