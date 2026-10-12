import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useEscapeKey } from './Modal';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Pinned below the scrolling body, e.g. action buttons. */
  footer?: ReactNode;
}

/** Right-hand slide-over panel — the web counterpart of mobile's bottom sheet. */
export default function Drawer({ open, onClose, title, children, footer }: DrawerProps) {
  useEscapeKey(open, onClose);
  if (!open) return null;

  return createPortal(
    <div className="overlay overlay-drawer" onMouseDown={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-footer">{footer}</div>}
      </aside>
    </div>,
    document.body
  );
}
