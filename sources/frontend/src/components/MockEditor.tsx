import React, { useState } from 'react';
import { X, Save, Play, Code2, FileJson, Copy, Check } from 'lucide-react';

interface MockEditorProps {
  isOpen: boolean;
  onClose: () => void;
  apiName: string;
}

const MockEditor: React.FC<MockEditorProps> = ({ isOpen, onClose, apiName }) => {
  const [mode, setMode] = useState<'json' | 'script'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonContent = `{
  "status": "success",
  "data": {
    "id": "user_8821",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "roles": ["admin", "editor"],
    "preferences": {
      "theme": "dark",
      "notifications": true
    }
  }
}`;

  const scriptContent = `// Dynamic Mock Script
// Use 'request' to access params
// Use 'response' to set body/status

if (request.query.id === 'admin') {
  response.status = 200;
  response.body = { role: 'SUPER_ADMIN' };
} else {
  response.status = 403;
  response.body = { error: 'Access Denied' };
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mode === 'json' ? jsonContent : scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Edit Mock Data</h3>
              <p className="text-xs text-slate-500">{apiName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex bg-white border border-slate-200 p-1 rounded-lg">
            <button 
              onClick={() => setMode('json')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mode === 'json' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileJson size={14} /> JSON
            </button>
            <button 
              onClick={() => setMode('script')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                mode === 'script' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Code2 size={14} /> SCRIPT
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer">
              <Play size={14} /> Test Run
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex">
          <div className="w-12 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 text-[10px] font-mono text-slate-300 select-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-6 flex items-center">{i + 1}</div>
            ))}
          </div>
          <textarea 
            spellCheck={false}
            className="flex-1 p-6 font-mono text-sm text-slate-800 focus:outline-none resize-none bg-white leading-relaxed"
            value={mode === 'json' ? jsonContent : scriptContent}
            readOnly
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            Last saved: Today at 14:22
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
              Cancel
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 cursor-pointer">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockEditor;
