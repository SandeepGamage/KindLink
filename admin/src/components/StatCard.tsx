import React from 'react';
import StatusBadge, { type BadgeTone } from './StatusBadge';

type AccentColor = 'blue' | 'green' | 'orange' | 'purple';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  accent: AccentColor;
  id?: string;
  /** Status pill shown in the top-right corner (takes the place of `trend`). */
  badge?: { text: string; tone: BadgeTone };
  /** Muted line under the label. */
  subtext?: string;
  /** Makes the whole card a button. */
  onClick?: () => void;
}

export default function StatCard({
  icon,
  value,
  label,
  trend,
  trendUp,
  accent,
  id,
  badge,
  subtext,
  onClick,
}: StatCardProps) {
  const content = (
    <>
      <div className={`stat-card-icon ${accent}`} aria-hidden="true">
        {icon}
      </div>

      {badge ? (
        <div className="stat-card-badge">
          <StatusBadge label={badge.text} tone={badge.tone} />
        </div>
      ) : (
        trend !== undefined && (
          <div className={`stat-card-trend ${trendUp ? 'up' : 'down'}`} aria-label={`${trendUp ? 'Up' : 'Down'} ${trend}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )
      )}

      <div className="stat-card-value">{value.toLocaleString()}</div>
      <div className="stat-card-label">{label}</div>
      {subtext && <div className="stat-card-subtext">{subtext}</div>}

      <div className={`stat-card-accent-bar ${accent}`} aria-hidden="true" />
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="stat-card clickable" id={id} onClick={onClick} aria-label={`${label}: ${value}`}>
        {content}
      </button>
    );
  }

  return (
    <div className="stat-card" id={id} role="region" aria-label={label}>
      {content}
    </div>
  );
}
