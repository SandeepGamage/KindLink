import React from 'react';

type AccentColor = 'blue' | 'green' | 'orange' | 'purple';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  accent: AccentColor;
  id?: string;
}

export default function StatCard({
  icon,
  value,
  label,
  trend,
  trendUp,
  accent,
  id,
}: StatCardProps) {
  return (
    <div className="stat-card" id={id} role="region" aria-label={label}>
      <div className={`stat-card-icon ${accent}`} aria-hidden="true">
        {icon}
      </div>

      {trend !== undefined && (
        <div className={`stat-card-trend ${trendUp ? 'up' : 'down'}`} aria-label={`${trendUp ? 'Up' : 'Down'} ${trend}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}

      <div className="stat-card-value">{value.toLocaleString()}</div>
      <div className="stat-card-label">{label}</div>

      <div className={`stat-card-accent-bar ${accent}`} aria-hidden="true" />
    </div>
  );
}
