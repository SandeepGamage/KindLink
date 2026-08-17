import React, { useState } from 'react';
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
import StatCard from '../components/StatCard';

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
    switch (type) {
      case 'INFO':
      case 'SYSTEM':
      case 'WELCOME':
        return 'badge badge-volunteer'; // Reusing info-like badge
      case 'ALERT':
        return 'badge badge-pending'; // Reusing warning-like badge
      default:
        return 'badge badge-user';
    }
  };

  const getAudienceBadgeClass = (audience: string) => {
    switch (audience) {
      case 'Targeted':
        return 'badge' + ' ' + 'purple-badge';
      case 'All Users':
      case 'New Users':
      default:
        return 'badge badge-user';
    }
  };

  return (
    <>
      <style>{`
        .purple-badge {
          background: rgba(124, 58, 237, 0.1);
          color: #7c3aed;
        }
        .page-header-right .btn-primary {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        .page-header-right .btn-primary:hover {
          background-color: #2563eb;
        }
        .page-header-right .btn-gradient {
          background: var(--grad-blue);
          color: white;
          border: 1px solid transparent;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .page-header-right .btn-gradient:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-brand);
        }
        .icon-btn {
          padding: 6px;
          border-radius: 6px;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .icon-btn:hover {
          background: rgba(59, 130, 246, 0.2);
        }
        .icon-btn.danger {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .icon-btn.danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .search-container {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .filter-outline-select {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #4a5568;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .filter-outline-select svg {
          color: #a0aec0;
        }
        .search-outline-input-wrapper {
          position: relative;
          flex: 1;
        }
        .search-outline-input {
          width: 100%;
          padding: 8px 12px 8px 36px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          color: #1a202c;
        }
        .search-outline-input::placeholder {
          color: #a0aec0;
        }
        .search-outline-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #a0aec0;
          pointer-events: none;
        }
      `}</style>
      
      {/* Page Header */}
      <div className="page-header" style={{ padding: '24px 32px', height: 'auto', background: 'transparent', borderBottom: 'none' }}>
        <div className="page-header-left">
          <h1 style={{ fontSize: '28px', color: '#1a202c' }}>Notification Center</h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px' }}>Monitor and manage system-wide broadcasts.</p>
        </div>
        <div className="page-header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '0 16px', height: '40px', display: 'inline-flex', alignItems: 'center' }}>
            <FileText size={18} /> Get Report
          </button>
          <button className="btn btn-primary btn-gradient" style={{ borderRadius: '8px', padding: '0 16px', height: '40px', display: 'inline-flex', alignItems: 'center' }} onClick={() => navigate('/notifications/create')}>
            <Plus size={18} /> New Broadcast
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="page-body page-animate" style={{ paddingTop: 0 }}>
        
        {/* Stat Cards */}
        <div className="stat-cards-grid">
          <StatCard
            id="stat-total"
            icon={<Send size={24} color="#3b82f6" />}
            value={29}
            label="TOTAL BROADCASTS"
            accent="blue"
          />
          <StatCard
            id="stat-critical"
            icon={<AlertCircle size={24} color="#ef4444" />}
            value={0}
            label="CRITICAL ALERTS"
            accent="orange"
          />
          <StatCard
            id="stat-targeted"
            icon={<Target size={24} color="#a855f7" />}
            value={26}
            label="TARGETED MESSAGES"
            accent="purple"
          />
          <StatCard
            id="stat-system"
            icon={<Info size={24} color="#10b981" />}
            value={3}
            label="SYSTEM INFO"
            accent="green"
          />
        </div>

        <div className="card">
          <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Zap size={20} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1a202c', margin: 0 }}>Broadcast Directory</h2>
            </div>
            
            <div className="search-container" style={{ width: '60%' }}>
              <div className="filter-outline-select" style={{ flex: '0 0 auto', width: '160px' }}>
                <Filter size={16} />
                <span>All Types</span>
              </div>
              <div className="filter-outline-select" style={{ flex: '0 0 auto', width: '160px' }}>
                <Target size={16} />
                <span>Any Audience</span>
              </div>
              <div className="search-outline-input-wrapper">
                <Search size={16} className="search-outline-icon" />
                <input 
                  type="text" 
                  className="search-outline-input" 
                  placeholder="Search words..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>TITLE / MESSAGE</th>
                  <th>TYPE</th>
                  <th>TARGET USER</th>
                  <th>DATE SENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {mockBroadcasts.map((broadcast) => (
                  <tr key={broadcast.id}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ fontWeight: 600, color: '#1a202c', fontSize: '15px' }}>{broadcast.title}</div>
                      <div style={{ color: '#718096', fontSize: '13px', marginTop: '4px' }}>{broadcast.message}</div>
                    </td>
                    <td>
                      <span className={getTypeBadgeClass(broadcast.type)} style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                        {broadcast.type}
                      </span>
                    </td>
                    <td>
                      <span className={getAudienceBadgeClass(broadcast.audience)} style={{ fontSize: '12px', fontWeight: 600 }}>
                        {broadcast.audience}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1a202c', fontSize: '14px' }}>{broadcast.date}</div>
                      <div style={{ color: '#718096', fontSize: '12px', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '10px' }}>🕒</span> {broadcast.time} • {broadcast.sender}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="icon-btn" aria-label="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="icon-btn danger" aria-label="Delete">
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
    </>
  );
}

