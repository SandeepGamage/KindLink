export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Uppercases the label — used for role chips. */
  uppercase?: boolean;
}

/**
 * Small pill for statuses, roles and counts. Tones match
 * mobile/src/components/admin/status-badge.tsx.
 */
export default function StatusBadge({ label, tone = 'neutral', uppercase }: StatusBadgeProps) {
  return (
    <span className={`status-badge tone-${tone}${uppercase ? ' uppercase' : ''}`}>{label}</span>
  );
}
