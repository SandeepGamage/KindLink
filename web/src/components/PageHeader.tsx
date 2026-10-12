import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { NAV_ITEMS } from './Sidebar';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Parent route for subpages; renders a breadcrumb back to it. Omit for top-level pages. */
  backTo?: string;
  actions?: ReactNode;
}

/** Title block at the top of every admin page, below the white top bar. */
export default function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
  const parent = backTo ? NAV_ITEMS.find((item) => item.to === backTo) : undefined;

  return (
    <div className="page-header">
      <div className="page-header-left">
        {backTo && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to={backTo}>{parent?.label ?? 'Back'}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
        )}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-right">{actions}</div>}
    </div>
  );
}
