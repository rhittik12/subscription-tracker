import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white/95 lg:text-4xl">
          Settings
        </h1>
        <p className="text-white/40 mt-2 text-sm font-medium">
          Configure your preferences and notification channels
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
