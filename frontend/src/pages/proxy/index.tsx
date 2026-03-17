import React from 'react';
import { Globe, ShieldCheck, Zap, Plus, Settings2 } from 'lucide-react';
import { MOCK_PROXY_GROUPS } from '../../types';

const ProxyConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Proxy Groups</h2>
          <p className="text-sm text-slate-500">Manage regex-based routing and automatic mock generation.</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors cursor-pointer">
          <Plus size={16} />
          Add Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_PROXY_GROUPS.map((group) => (
          <div key={group.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Globe size={20} />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  group.mode === 'Mock' ? 'bg-amber-100 text-amber-700' :
                  group.mode === 'Proxy' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {group.mode}
                </span>
                <button type="button" className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <Settings2 size={16} />
                </button>
              </div>
            </div>

            <h3 className="font-semibold text-slate-900 mb-1">{group.name}</h3>
            <div className="mono text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 mb-4 truncate">
              {group.regex}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <ShieldCheck size={14} className={group.autoSave ? 'text-emerald-500' : 'text-slate-300'} />
                <span>Auto-save {group.autoSave ? 'On' : 'Off'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap size={14} className="text-blue-500" />
                <span>{group.rulesCount} Rules</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-xl p-6 text-white flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-1">Global Proxy Server</h3>
          <p className="text-blue-100 text-sm opacity-90">Your project proxy is active at: <span className="mono font-bold">https://proxy.mockdev.io/p-8821</span></p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button type="button" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm cursor-pointer">
            Copy URL
          </button>
          <button type="button" className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors cursor-pointer">
            Restart Server
          </button>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Globe size={200} />
        </div>
      </div>
    </div>
  );
};

export default ProxyConfig;
