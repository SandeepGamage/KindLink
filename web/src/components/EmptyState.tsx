import React from 'react';
import { RotateCw } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message?: string;
  /** Shows a "Try again" button when given. */
  onRetry?: () => void;
}

export default function EmptyState({ icon, title, message, onRetry }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          <RotateCw size={14} /> Try again
        </button>
      )}
    </div>
  );
}
