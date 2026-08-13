import React, { useState } from 'react';

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
        <div className="settings-grid">
          {/* Platform Settings */}
          <div className="settings-card">
            <div className="settings-card-title">🌐 Platform Settings</div>
            <div className="settings-card-desc">
              Control global platform behaviour and features.
            </div>
            <ToggleSetting
              id="setting-user-registration"
              label="User Registration"
              sub="Allow new users to self-register on the platform"
              defaultChecked
            />
            <ToggleSetting
              id="setting-volunteer-matching"
              label="Volunteer Matching"
              sub="Automatically match volunteers with assistance requests"
              defaultChecked
            />
            <ToggleSetting
              id="setting-notifications"
              label="Push Notifications"
              sub="Send push notifications to users via the mobile app"
              defaultChecked
            />
            <ToggleSetting
              id="setting-maintenance-mode"
              label="Maintenance Mode"
              sub="Temporarily disable public access for maintenance"
            />
          </div>

          {/* Approval Settings */}
          <div className="settings-card">
            <div className="settings-card-title">✅ Approval Workflow</div>
            <div className="settings-card-desc">
              Configure how user registrations are reviewed and approved.
            </div>
            <ToggleSetting
              id="setting-manual-approval"
              label="Manual Admin Approval"
              sub="Require admin review for all new volunteer & caregiver accounts"
              defaultChecked
            />
            <ToggleSetting
              id="setting-auto-approve-elderly"
              label="Auto-approve Elderly Users"
              sub="Automatically approve Elderly User registrations without review"
              defaultChecked
            />
            <ToggleSetting
              id="setting-email-notify-approval"
              label="Email on Approval"
              sub="Notify users via email when their account is approved or rejected"
              defaultChecked
            />
            <ToggleSetting
              id="setting-id-verification"
              label="ID Verification Required"
              sub="Require government ID upload for volunteer and caregiver accounts"
            />
          </div>

          {/* Security Settings */}
          <div className="settings-card">
            <div className="settings-card-title">🔐 Security</div>
            <div className="settings-card-desc">
              Authentication and session security configuration.
            </div>
            <ToggleSetting
              id="setting-2fa"
              label="Two-Factor Authentication"
              sub="Require 2FA for all administrator accounts"
            />
            <ToggleSetting
              id="setting-session-timeout"
              label="Session Timeout"
              sub="Automatically log out inactive admin sessions after 30 minutes"
              defaultChecked
            />
            <ToggleSetting
              id="setting-rate-limiting"
              label="API Rate Limiting"
              sub="Protect the backend API from excessive requests"
              defaultChecked
            />
            <ToggleSetting
              id="setting-audit-log"
              label="Audit Logging"
              sub="Log all admin actions for security and compliance purposes"
              defaultChecked
            />
          </div>

          {/* API & Integration */}
          <div className="settings-card">
            <div className="settings-card-title">🔗 API & Integrations</div>
            <div className="settings-card-desc">
              Backend connection and third-party integrations.
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Backend API</div>
                <div className="settings-row-sub">Connected to KindLink backend</div>
              </div>
              <span
                className="badge badge-active"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                ● Online
              </span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Database</div>
                <div className="settings-row-sub">MongoDB Atlas</div>
              </div>
              <span
                className="badge badge-active"
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                ● Connected
              </span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">API Version</div>
                <div className="settings-row-sub">v1.0.0 — KindLink Backend</div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-dark-sec)', fontWeight: 500 }}>
                v1.0.0
              </span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Admin Portal Version</div>
                <div className="settings-row-sub">Current release</div>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-dark-sec)', fontWeight: 500 }}>
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
