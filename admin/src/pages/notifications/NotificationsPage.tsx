import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  AlertCircle, 
  Target, 
  Info, 
  Zap, 
  FileText, 
  Plus, 
  Filter, 
  Search, 
  Pencil, 
  Trash2 
} from 'lucide-react';
import StatCard from '../../components/StatCard';

const mockBroadcasts = [
  {
    id: 1,
    title: 'System Maintenance222',
    message: 'From 1AM to 3AM on 28 April',
    type: 'INFO',
    audience: 'All Users',
    date: 'Apr 21',
    time: '08:43 AM',
    sender: 'EverGreen',
  },
  {
    id: 2,
    title: 'Email Verification',
    message: 'Successfully verified your E-mail ✅🎉',
    type: 'SYSTEM',
    audience: 'Targeted',
    date: 'Apr 21',
    time: '08:42 AM',
    sender: 'system',
  },
  {
    id: 3,
    title: 'Email Verification',
    message: 'Successfully verified your E-mail ✅🎉',
    type: 'SYSTEM',
    audience: 'Targeted',
    date: 'Apr 21',
    time: '12:13 AM',
    sender: 'system',
  },
  {
    id: 4,
    title: 'Welcome to KindLink',
    message: 'Thank you for joining our community.',
    type: 'WELCOME',
    audience: 'New Users',
    date: 'Apr 20',
    time: '09:00 AM',
    sender: 'system',
  },
  {
    id: 5,
    title: 'Urgent: Server Restart',
    message: 'Server will restart in 10 minutes.',
    type: 'ALERT',
    audience: 'All Users',
    date: 'Apr 19',
    time: '11:45 PM',
    sender: 'Admin',
  },
];

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const getTypeBadgeClass = (type: string) => {
    const base = "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ";
    switch (type) {
      case 'INFO':
      case 'SYSTEM':
      case 'WELCOME':
        return base + "bg-info/20 text-info border-info/20";
      case 'ALERT':
        return base + "bg-warning-bg text-warning border-warning/20";
      default:
        return base + "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  const getAudienceBadgeClass = (audience: string) => {
    const base = "px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ";
    switch (audience) {
      case 'Targeted':
        return base + "bg-purple-500/20 text-purple-400 border-purple-500/20";
      case 'All Users':
      case 'New Users':
      default:
        return base + "bg-gray-500/20 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:p-8 pb-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Notification Center</h1>
          <p className="text-sm text-text-secondary mt-1">Monitor and manage system-wide broadcasts.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            <FileText size={18} className="mr-1.5" /> Get Report
          </button>
          <button 
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-gradient-to-r from-blue-700 to-sky-500 text-white font-medium hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(30,58,138,0.35)] transition-all border border-transparent"
            onClick={() => navigate('/notifications/create')}
          >
            <Plus size={18} className="mr-1.5" /> New Broadcast
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto flex flex-col gap-6">
        
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            id="stat-total"
            icon={<Send size={24} className="text-blue-500" />}
            value={29}
            label="TOTAL BROADCASTS"
            accent="blue"
          />
          <StatCard
            id="stat-critical"
            icon={<AlertCircle size={24} className="text-red-500" />}
            value={0}
            label="CRITICAL ALERTS"
            accent="orange"
          />
          <StatCard
            id="stat-targeted"
            icon={<Target size={24} className="text-purple-500" />}
            value={26}
            label="TARGETED MESSAGES"
            accent="purple"
          />
          <StatCard
            id="stat-system"
            icon={<Info size={24} className="text-emerald-500" />}
            value={3}
            label="SYSTEM INFO"
            accent="green"
          />
        </div>

        <div className="bg-bg-card border border-border rounded-xl shadow-sm flex flex-col">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between p-5 border-b border-border gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-bold text-text-primary">Broadcast Directory</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-3/5">
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-bg-app text-text-primary text-sm cursor-pointer w-full sm:w-40 flex-shrink-0">
                <Filter size={16} className="text-text-muted" />
                <span>All Types</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-bg-app text-text-primary text-sm cursor-pointer w-full sm:w-40 flex-shrink-0">
                <Target size={16} className="text-text-muted" />
                <span>Any Audience</span>
              </div>
              <div className="relative flex-1 w-full flex-shrink-0 sm:flex-shrink">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input 
                  type="text" 
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-app text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-brand"
                  placeholder="Search words..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider bg-bg-row/50">TITLE / MESSAGE</th>
                  <th className="px-6 py-4 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider bg-bg-row/50">TYPE</th>
                  <th className="px-6 py-4 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider bg-bg-row/50">TARGET USER</th>
                  <th className="px-6 py-4 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider bg-bg-row/50">DATE SENT</th>
                  <th className="px-6 py-4 border-b border-border text-xs font-semibold text-text-secondary uppercase tracking-wider bg-bg-row/50">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockBroadcasts.map((broadcast) => (
                  <tr key={broadcast.id} className="hover:bg-bg-row-hover transition-colors">
                    <td className="px-6 py-4 border-b border-border/50">
                      <div className="font-semibold text-text-primary text-[15px]">{broadcast.title}</div>
                      <div className="text-text-secondary text-[13px] mt-1">{broadcast.message}</div>
                    </td>
                    <td className="px-6 py-4 border-b border-border/50">
                      <span className={getTypeBadgeClass(broadcast.type)}>
                        {broadcast.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-border/50">
                      <span className={getAudienceBadgeClass(broadcast.audience)}>
                        {broadcast.audience}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b border-border/50">
                      <div className="font-semibold text-text-primary text-sm">{broadcast.date}</div>
                      <div className="text-text-secondary text-xs mt-1 flex items-center gap-1">
                        <span className="text-[10px]">🕒</span> {broadcast.time} • {broadcast.sender}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-border/50">
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-md text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-colors inline-flex" aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="p-1.5 rounded-md text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors inline-flex" aria-label="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

