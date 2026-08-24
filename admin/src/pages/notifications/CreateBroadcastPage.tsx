import React, { useState } from 'react';
import { ArrowLeft, Send, Megaphone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateBroadcastPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('System Info');
  const [body, setBody] = useState('');

  return (
    <>
      <style>{`
        .form-group {
          margin-bottom: 24px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .form-input, .form-textarea, .form-select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
          color: #1a202c;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus, .form-textarea:focus, .form-select:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        .form-input::placeholder, .form-textarea::placeholder {
          color: #a0aec0;
          font-weight: 500;
        }
        .form-textarea {
          min-height: 120px;
          resize: vertical;
        }
        .btn-publish {
          width: 100%;
          background: var(--grad-blue);
          color: white;
          border-radius: 12px;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-publish:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-brand);
        }
        .preview-container {
          border: 2px dashed #e2e8f0;
          border-radius: 20px;
          padding: 32px;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 16px;
        }
        .device-frame {
          width: 100%;
          max-width: 380px;
          background: #f8fafc;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          border: 1px solid #f1f5f9;
        }
        .device-header {
          padding: 16px 20px;
          font-size: 13px;
          font-weight: 600;
          color: #4a5568;
          border-bottom: 1px solid #f1f5f9;
          background: #ffffff;
        }
        .device-body {
          padding: 24px;
          background: #f8fafc;
        }
        .toast-notification {
          background: #f0f7ff;
          border: 1px solid #e0f2fe;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
        }
        .toast-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #3b82f6;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .toast-content {
          flex: 1;
        }
        .toast-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a202c;
          margin-bottom: 4px;
        }
        .toast-body {
          font-size: 13px;
          color: #4a5568;
          line-height: 1.5;
          margin-bottom: 8px;
        }
        .toast-meta {
          font-size: 10px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s;
          margin-right: 16px;
        }
        .back-btn:hover {
          background: #f8fafc;
          color: #1a202c;
        }
      `}</style>
      
      <div className="page-header" style={{ padding: '24px 32px', height: 'auto', background: 'transparent', borderBottom: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '16px' }}>
        <button className="back-btn" onClick={() => navigate('/notifications')} aria-label="Go back" style={{ marginRight: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <div className="page-header-left" style={{ textAlign: 'left' }}>
          <h1 style={{ fontSize: '28px', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            Create Broadcast <span style={{ color: '#fbbf24' }}>✨</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#718096', marginTop: '4px', margin: 0 }}>
            Compose a new message to instantly notify your platform users.
          </p>
        </div>
      </div>

      <div className="page-body page-animate" style={{ paddingTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '40px', alignItems: 'stretch' }}>
          
          {/* Form Side */}
          <div className="card" style={{ padding: '32px', borderRadius: '20px', position: 'relative', overflow: 'hidden', height: '100%' }}>
            {/* Decorative blob */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: '#ecfdf5', borderRadius: '50%', zIndex: 0 }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="form-group">
                <label className="form-label">Headline / Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Global Planting Mission Complete!" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notification Type</label>
                <select 
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="System Info">System Info</option>
                  <option value="Alert">Alert</option>
                  <option value="Welcome">Welcome</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="form-label">Full Message Body</label>
                <textarea 
                  className="form-textarea" 
                  style={{ flex: 1 }}
                  placeholder="Write the detailed broadcast message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                ></textarea>
              </div>

              <button className="btn-publish" style={{ marginTop: 'auto' }}>
                <Send size={18} /> Publish Broadcast
              </button>
            </div>
          </div>

          {/* Preview Side */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontWeight: 700, fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              <Megaphone size={16} /> LIVE PREVIEW
            </div>
            
            <div className="preview-container" style={{ flex: 1, justifyContent: 'center' }}>
              <div className="device-frame">
                <div className="device-header">
                  User's Device
                </div>
                <div className="device-body">
                  <div className="toast-notification">
                    <div className="toast-icon">
                      <Info size={18} />
                    </div>
                    <div className="toast-content">
                      <div className="toast-title">{title || 'Notification Title'}</div>
                      <div className="toast-body">
                        {body || 'Your notification body will appear here. It expands gracefully to fit multiple lines.'}
                      </div>
                      <div className="toast-meta">JUST NOW • SYSTEM</div>
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ marginTop: '24px', fontSize: '13px', color: '#94a3b8', textAlign: 'center', maxWidth: '300px' }}>
                This is how the notification will appear to users in their inbox or toast popups.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
