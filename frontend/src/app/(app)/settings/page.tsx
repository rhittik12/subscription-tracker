import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="app-page">
      <div>
        <span className="app-kicker">Preferences</span>
        <h1 className="app-page-title mt-4">Settings</h1>
        <p className="app-page-copy">Configure currency, renewal reminders, and notification channels.</p>
      </div>
      <SettingsForm />
    </div>
  );
}
