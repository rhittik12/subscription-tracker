'use client';

import { useState, useEffect } from 'react';
import { UserSettings, CURRENCIES } from '@/types';
import { getSettings, updateSettings, sendTestNotification } from '@/lib/api';
import { Save, Send, Mail, MessageSquare } from 'lucide-react';

export function SettingsForm() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [preferredCurrency, setPreferredCurrency] = useState('INR');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
        setPreferredCurrency(data.preferred_currency);
        setEmail(data.email || '');
        setWhatsappNumber(data.whatsapp_number || '');
        setEmailNotifications(data.email_notifications);
        setWhatsappNotifications(data.whatsapp_notifications);
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
        whatsapp_number: whatsappNumber,
        email_notifications: emailNotifications,
        whatsapp_notifications: whatsappNotifications,
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

  async function handleTestNotification(type: 'email' | 'whatsapp') {
    const setTesting = type === 'email' ? setTestingEmail : setTestingWhatsApp;
    setTesting(true);
    setMessage(null);
    try {
      const result = await sendTestNotification(type);
      setMessage({ type: 'success', text: result.message });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || `Failed to send test ${type}` });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl glass-chip animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {message && (
        <div className={`p-4 rounded-2xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Currency */}
      <div className="glass-card glass-reflection rounded-2xl p-6">
        <div className="relative z-10">
          <h3 className="font-semibold text-white/85 mb-4">Display Currency</h3>
          <p className="text-sm text-white/35 mb-3">
            All spending totals will be converted to this currency
          </p>
          <select
            value={preferredCurrency}
            onChange={(e) => setPreferredCurrency(e.target.value)}
            className="glass-input w-full sm:w-auto rounded-xl px-3 py-2.5 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#0f1223] text-white">{c.symbol} {c.code} - {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="glass-card glass-reflection rounded-2xl p-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/15 ring-1 ring-white/20">
                <Mail size={18} className="text-white/85" />
              </div>
              <h3 className="font-semibold text-white/85">Email Notifications</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/70 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/60"></div>
            </label>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            onClick={() => handleTestNotification('email')}
            disabled={testingEmail || !email}
            className="mt-3 inline-flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-white/85"
          >
            <Send size={14} />
            {testingEmail ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
      </div>

      {/* WhatsApp Notifications */}
      <div className="glass-card glass-reflection rounded-2xl p-6">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
                <MessageSquare size={18} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white/85">WhatsApp Notifications</h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={(e) => setWhatsappNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:ring-2 peer-focus:ring-white/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/70 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/60"></div>
            </label>
          </div>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+91 9876543210"
            className="glass-input w-full rounded-xl px-3 py-2.5 text-sm"
          />
          <p className="text-xs text-white/25 mt-1.5">Include country code (e.g. +91)</p>
          <button
            onClick={() => handleTestNotification('whatsapp')}
            disabled={testingWhatsApp || !whatsappNumber}
            className="mt-3 inline-flex items-center gap-2 text-sm text-white/85 hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-white/85"
          >
            <Send size={14} />
            {testingWhatsApp ? 'Sending...' : 'Send Test WhatsApp'}
          </button>
        </div>
      </div>

      {/* Reminder Days */}
      <div className="glass-card glass-reflection rounded-2xl p-6">
        <div className="relative z-10">
          <h3 className="font-semibold text-white/85 mb-4">Reminder Timing</h3>
          <p className="text-sm text-white/35 mb-3">
            How many days before renewal should you be notified?
          </p>
          <select
            value={reminderDays}
            onChange={(e) => setReminderDays(Number(e.target.value))}
            className="glass-input w-full sm:w-auto rounded-xl px-3 py-2.5 text-sm"
          >
            <option value={1} className="bg-[#0f1223] text-white">1 day before</option>
            <option value={3} className="bg-[#0f1223] text-white">3 days before</option>
            <option value={5} className="bg-[#0f1223] text-white">5 days before</option>
            <option value={7} className="bg-[#0f1223] text-white">7 days before</option>
            <option value={14} className="bg-[#0f1223] text-white">14 days before</option>
            <option value={30} className="bg-[#0f1223] text-white">30 days before</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="glass-btn inline-flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
