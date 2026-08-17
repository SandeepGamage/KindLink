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
  const getIconGradient = (color: AccentColor) => {
    switch (color) {
      case 'blue': return 'bg-gradient-to-br from-blue-700 to-sky-500 shadow-[0_4px_20px_rgba(30,58,138,0.35)]';
      case 'green': return 'bg-gradient-to-br from-emerald-600 to-emerald-400 shadow-[0_4px_20px_rgba(5,150,105,0.35)]';
      case 'orange': return 'bg-gradient-to-br from-amber-600 to-amber-400 shadow-[0_4px_20px_rgba(217,119,6,0.35)]';
      case 'purple': return 'bg-gradient-to-br from-purple-700 to-purple-400 shadow-[0_4px_20px_rgba(124,58,237,0.35)]';
    }
  };

  const getBarGradient = (color: AccentColor) => {
    switch (color) {
      case 'blue': return 'bg-gradient-to-r from-blue-700 to-sky-500';
      case 'green': return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
      case 'orange': return 'bg-gradient-to-r from-amber-600 to-amber-400';
      case 'purple': return 'bg-gradient-to-r from-purple-700 to-purple-400';
    }
  };

  return (
    <div className="relative flex flex-col p-6 rounded-xl bg-bg-card border border-border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-bg-card-hover" id={id} role="region" aria-label={label}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4 ${getIconGradient(accent)}`} aria-hidden="true">
        {icon}
      </div>

      {trend !== undefined && (
        <div className={`absolute top-6 right-6 text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-full ${trendUp ? 'text-success bg-success-bg' : 'text-danger bg-danger-bg'}`} aria-label={`${trendUp ? 'Up' : 'Down'} ${trend}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}

      <div className="text-3xl font-bold text-text-primary tracking-tight leading-none mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-text-secondary font-medium">{label}</div>

      <div className={`absolute bottom-0 left-0 w-full h-1 ${getBarGradient(accent)}`} aria-hidden="true" />
    </div>
  );
}
