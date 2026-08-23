import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface ToggleSettingProps {
  id: string;
  label: string;
  sub: string;
  defaultChecked?: boolean;
}

function ToggleSetting({ id, label, sub, defaultChecked = false }: ToggleSettingProps) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="settings-row">
      <div>
        <div className="settings-row-label">{label}</div>
        <div className="settings-row-sub">{sub}</div>
      </div>
      <label className="toggle" htmlFor={id} aria-label={label}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={() => setChecked((c) => !c)}
        />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings</h1>
          <p>Configure the KindLink platform</p>
        </div>
        <div className="page-header-right">
          <button id="btn-save-settings" className="btn btn-primary">
            💾 Save Changes
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="page-body page-animate">
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Settings size={40} /></div>
            <h3>Coming Soon</h3>
            <p>Settings are currently under development.</p>
          </div>
        </div>
      </div>
    </>
  );
}
