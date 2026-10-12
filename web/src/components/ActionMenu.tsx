import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger';
  onSelect: () => void;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  ariaLabel: string;
}

const MENU_WIDTH = 220;

/**
 * ⋮ button that opens a small dropdown of row actions. The list is portalled
 * with fixed positioning so scrolling table / card containers can't clip it.
 */
export default function ActionMenu({ items, ariaLabel }: ActionMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const open = position !== null;

  const toggle = () => {
    if (open) {
      setPosition(null);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const estimatedHeight = items.length * 40 + 12;
    const fitsBelow = rect.bottom + estimatedHeight < window.innerHeight;
    setPosition({
      top: fitsBelow ? rect.bottom + 4 : rect.top - estimatedHeight - 4,
      left: Math.max(8, rect.right - MENU_WIDTH),
    });
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setPosition(null);
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!listRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', close);
    // Capture so scrolling any ancestor container closes the menu.
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="icon-btn"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        <MoreVertical size={18} />
      </button>
      {position &&
        createPortal(
          <div
            ref={listRef}
            className="action-menu-list"
            role="menu"
            style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`action-menu-item${item.tone === 'danger' ? ' danger' : ''}`}
                onClick={() => {
                  setPosition(null);
                  item.onSelect();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
