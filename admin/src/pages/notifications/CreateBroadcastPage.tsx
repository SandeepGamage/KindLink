import { useState } from 'react';
import { ArrowLeft, Send, Megaphone, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateBroadcastPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('System Info');
  const [body, setBody] = useState('');

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-start gap-4 p-6 lg:p-8 pb-0">
        <button 
          className="w-10 h-10 rounded-xl bg-bg-card border border-border flex items-center justify-center text-text-secondary hover:bg-bg-row-hover hover:text-text-primary transition-colors flex-shrink-0"
          onClick={() => navigate('/notifications')} 
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col text-left">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 m-0 tracking-tight">
            Create Broadcast <span className="text-amber-400">✨</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1 m-0">
            Compose a new message to instantly notify your platform users.
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full min-h-[500px]">
          
          {/* Form Side */}
          <div className="bg-bg-card border border-border rounded-2xl relative overflow-hidden flex flex-col p-8">
            {/* Decorative blob */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full z-0 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-6 flex flex-col">
                <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wide mb-2">Headline / Title</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm text-text-primary bg-bg-app outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-text-muted"
                  placeholder="e.g., Global Planting Mission Complete!" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-6 flex flex-col">
                <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wide mb-2">Notification Type</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm text-text-primary bg-bg-app outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="System Info">System Info</option>
                  <option value="Alert">Alert</option>
                  <option value="Welcome">Welcome</option>
                </select>
              </div>

              <div className="mb-6 flex flex-col flex-1">
                <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wide mb-2">Full Message Body</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm text-text-primary bg-bg-app outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-text-muted flex-1 min-h-[120px] resize-y"
                  placeholder="Write the detailed broadcast message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                ></textarea>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-700 to-sky-500 text-white rounded-xl p-3.5 text-base font-semibold flex items-center justify-center gap-2 border-none cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_4px_20px_rgba(30,58,138,0.35)] transition-all mt-auto">
                <Send size={18} /> Publish Broadcast
              </button>
            </div>
          </div>

          {/* Preview Side */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 text-text-muted font-bold text-[13px] tracking-wide uppercase mb-4">
              <Megaphone size={16} /> LIVE PREVIEW
            </div>
            
            <div className="border-2 border-dashed border-border rounded-[20px] p-8 bg-bg-card flex flex-col items-center flex-1 justify-center">
              <div className="w-full max-w-[380px] bg-bg-app rounded-2xl shadow-lg overflow-hidden border border-border">
                <div className="p-4 px-5 text-[13px] font-semibold text-text-secondary border-b border-border bg-bg-card">
                  User's Device
                </div>
                <div className="p-6 bg-bg-app">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                      <Info size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-text-primary mb-1">{title || 'Notification Title'}</div>
                      <div className="text-[13px] text-text-secondary leading-relaxed mb-2">
                        {body || 'Your notification body will appear here. It expands gracefully to fit multiple lines.'}
                      </div>
                      <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">JUST NOW • SYSTEM</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-[13px] text-text-muted text-center max-w-[300px]">
                This is how the notification will appear to users in their inbox or toast popups.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
