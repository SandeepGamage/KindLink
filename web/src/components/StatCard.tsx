import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  id?: string;
  /** Muted line under the label. */
  subtext?: string;
  /** Makes the whole card a button. */
  onClick?: () => void;
}

export default function StatCard({
  icon,
  value,
  label,
  id,
  subtext,
  onClick,
}: StatCardProps) {
  const content = (
    <>
      <div className="stat-card-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="stat-card-text">
        <div className="stat-card-value">{value.toLocaleString()}</div>
        <div className="stat-card-label">{label}</div>
        {subtext && <div className="stat-card-subtext">{subtext}</div>}
      </div>
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
