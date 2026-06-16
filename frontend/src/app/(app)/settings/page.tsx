import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-black lg:text-4xl">Settings</h1>
        <p className="mt-2 text-sm font-medium text-black">Configure your preferences and notification channels</p>
      </div>
      <SettingsForm />
    </div>
  );
}
