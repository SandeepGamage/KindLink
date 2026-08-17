import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:p-8 pb-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">Configure the KindLink platform</p>
        </div>
        <div className="flex-shrink-0">
          <button id="btn-save-settings" className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            💾 Save Changes
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="bg-bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-row flex items-center justify-center text-text-muted mb-4">
              <Settings size={32} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Coming Soon</h3>
            <p className="text-sm text-text-secondary">Settings are currently under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
