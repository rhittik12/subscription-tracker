'use client';

import { useState, useEffect } from 'react';
import { UserSettings, CURRENCIES } from '@/types';
import { getSettings, updateSettings, sendTestNotification } from '@/lib/api';
import { Save, Send, Mail } from 'lucide-react';

export function SettingsForm() {
  const [, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
        setPreferredCurrency(data.preferred_currency);
        setEmail(data.email || '');
        setEmailNotifications(data.email_notifications);
        setReminderDays(data.reminder_days_before);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const updated = await updateSettings({
        preferred_currency: preferredCurrency,
        email,
        email_notifications: emailNotifications,
        reminder_days_before: reminderDays,
      });
      setSettings(updated);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestNotification(type: 'email') {
    setTestingEmail(true);
    setMessage(null);
    try {
      const result = await sendTestNotification(type);
      setMessage({ type: 'success', text: result.message });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || `Failed to send test ${type}` });
    } finally {
      setTestingEmail(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse border-[3px] border-black bg-[#eae7e2] shadow-[4px_4px_0_#111]" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {message && (
        <div className={`border-[3px] border-black p-4 text-sm font-extrabold ${message.type === 'success'
          ? 'bg-[#d9f0c6] text-black'
          : 'bg-[#fca5a5] text-black'
          }`}>
          {message.text}
        </div>
      )}

      {/* Currency */}
      <div className="app-panel app-panel-amber p-4 sm:p-6">
        <div className="relative z-10">
          <h3 className="font-headline mb-3 text-2xl font-extrabold text-black">Display Currency</h3>
          <p className="mb-4 text-sm font-semibold leading-6 text-black/70">
            All spending totals will be converted to this currency
          </p>
          <select
            value={preferredCurrency}
            onChange={(e) => setPreferredCurrency(e.target.value)}
            className="app-field sm:w-auto"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-white text-black">
                {c.symbol} {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="app-panel app-panel-blue p-4 sm:p-6">
        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="border-[3px] border-black bg-white p-2.5">
                <Mail size={18} className="text-black" />
              </div>
              <h3 className="font-headline text-xl font-extrabold text-black sm:text-2xl">Email Notifications</h3>
            </div>
            <label className="relative inline-flex h-8 w-14 cursor-pointer items-center">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <span className="absolute inset-0 border-[3px] border-black bg-white shadow-[4px_4px_0_#111] transition-colors peer-checked:bg-[#d9ff63]" />
              <span className="absolute left-[3px] top-[3px] h-[calc(100%-6px)] w-[calc(50%-3px)] border-r-[3px] border-black bg-white transition-transform peer-checked:translate-x-full" />
            </label>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="app-field"
          />
          <button
            onClick={() => handleTestNotification('email')}
            disabled={testingEmail || !email}
            className="mt-4 inline-flex items-center gap-2 border-b-2 border-black text-sm font-extrabold uppercase text-black transition-colors hover:bg-white disabled:opacity-40"
          >
            <Send size={14} />
            {testingEmail ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {/* Reminder Days */}
      <div className="app-panel p-4 sm:p-6">
        <div className="relative z-10">
          <h3 className="font-headline mb-3 text-2xl font-extrabold text-black">Reminder Timing</h3>
          <p className="mb-4 text-sm font-semibold leading-6 text-black/70">
            How many days before renewal should you be notified?
          </p>
          <select
            value={reminderDays}
            onChange={(e) => setReminderDays(Number(e.target.value))}
            className="app-field sm:w-auto"
          >
            <option value={1} className="bg-white text-black">1 day before</option>
            <option value={3} className="bg-white text-black">3 days before</option>
            <option value={5} className="bg-white text-black">5 days before</option>
            <option value={7} className="bg-white text-black">7 days before</option>
            <option value={14} className="bg-white text-black">14 days before</option>
            <option value={30} className="bg-white text-black">30 days before</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-stretch sm:justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="app-button mobile-full-button w-full bg-black text-white disabled:opacity-50 sm:w-auto"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
