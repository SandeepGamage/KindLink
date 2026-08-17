import { useAuth } from '../../context/AuthContext';
import { Hand, Calendar, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:p-8 pb-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
            {greeting}, {user?.name?.split(' ')[0] ?? 'Admin'} <Hand size={18} className="inline ml-1" />
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="flex items-center text-[13px] font-medium text-brand-dark bg-brand-light border border-brand/20 rounded-lg px-3.5 py-1.5">
            <Calendar size={16} className="mr-1.5" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="bg-bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-row flex items-center justify-center text-text-muted mb-4">
              <LayoutDashboard size={32} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Coming Soon</h3>
            <p className="text-sm text-text-secondary">The dashboard is currently under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
