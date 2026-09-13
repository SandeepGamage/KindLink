import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Closes on Escape while `open`. Shared by Modal, ActionModal and Drawer. */
export function useEscapeKey(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Wider body, e.g. for an image preview. */
  size?: 'sm' | 'lg';
}

/** Centered dialog on a dimmed backdrop. Clicking the backdrop closes it. */
export default function Modal({ open, onClose, title, children, size = 'sm' }: ModalProps) {
  useEscapeKey(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="overlay" onMouseDown={onClose}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

interface ActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  tone?: 'primary' | 'danger';
  icon?: ReactNode;
  loading?: boolean;
}

/**
 * Generic confirm dialog — the web counterpart of mobile's ActionModal. Used for
 * every approve / reject / activate / delete / publish / sign-out confirmation.
 */
export function ActionModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  tone = 'primary',
  icon,
  loading,
}: ActionModalProps) {
  // Don't let Escape or the backdrop dismiss a request that is in flight.
  const close = () => {
    if (!loading) onClose();
  };

  return (
    <Modal open={open} onClose={close}>
      <div className="action-modal">
        {icon && <div className={`action-modal-icon ${tone}`}>{icon}</div>}
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="action-modal-buttons">
          <button type="button" className="btn btn-ghost" onClick={close} disabled={loading}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger-solid' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
