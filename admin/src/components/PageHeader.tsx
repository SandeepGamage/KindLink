import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Route for the back button; omit for top-level pages. */
  backTo?: string;
  actions?: ReactNode;
}

/** The brand-blue bar at the top of every admin page. */
export default function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="page-header">
      <div className="page-header-left">
        {backTo && (
          <button type="button" className="header-back-btn" onClick={() => navigate(backTo)} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
        )}
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header-right">{actions}</div>}
    </div>
  );
}
