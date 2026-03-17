import React, { useState } from 'react';
import { 
  Search, Plus, MoreVertical, Code2, ChevronRight, Globe, Clock, Settings2, Trash2, Save, X, Copy, 
  Info, Terminal, ShieldCheck, Zap, Database, ListFilter, ChevronDown, Braces, Type, AlertCircle,
  Server, Cpu, FileJson, Folder, FolderTree, List
} from 'lucide-react';
import { MOCK_APIS } from '../types';
import SelectableInput from '../components/SelectableInput';
import { useLanguage } from '../context/LanguageContext';

const ApiTable: React.FC = () => {
  const [selectedApiId, setSelectedApiId] = useState<string | null>(MOCK_APIS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('headers');
  const [responseMode, setResponseMode] = useState<'static' | 'script' | 'proxy'>('static');
  const [proxyUrl, setProxyUrl] = useState('https://api.production.com');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/api', '/api/v1']));
  const { t } = useLanguage();

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  interface ApiTreeNode {
    id: string;
    name: string;
    type: 'folder' | 'api';
    path: string;
    method?: string;
    children?: ApiTreeNode[];
    apiId?: string;
  }

  const buildApiTree = (apis: any[]): ApiTreeNode[] => {
    const root: any = { children: {} };
    
    apis.forEach(api => {
      const parts = api.path.split('/').filter(Boolean);
      let current = root;
      
      parts.forEach((part, index) => {
        if (!current.children[part]) {
          current.children[part] = { 
            name: part, 
            children: {}, 
            apis: [],
            path: '/' + parts.slice(0, index + 1).join('/')
          };
        }
        current = current.children[part];
        if (index === parts.length - 1) {
          current.apis.push(api);
        }
      });
    });

    const convert = (node: any): ApiTreeNode[] => {
      const result: ApiTreeNode[] = [];
      
      // Sort keys to maintain consistent order
      Object.keys(node.children).sort().forEach(key => {
        const child = node.children[key];
        result.push({
          id: `folder-${child.path}`,
          name: child.name,
          type: 'folder',
          path: child.path,
          children: [...convert(child), ...child.apis.map((api: any) => ({
            id: api.id,
            name: api.name,
            type: 'api',
            path: api.path,
            method: api.method,
            apiId: api.id
          }))]
        });
      });
      
      return result;
    };

    return convert(root);
  };

  const renderTree = (nodes: ApiTreeNode[], level = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.path);
      
      if (node.type === 'folder') {
        return (
          <div key={node.id}>
            <button
              onClick={() => toggleFolder(node.path)}
              className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-slate-100 transition-colors text-slate-600"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </div>
              <Folder size={12} className="text-blue-400 shrink-0" />
              <span className="text-[11px] font-bold truncate">{node.name}</span>
            </button>
            {isExpanded && node.children && renderTree(node.children, level + 1)}
          </div>
        );
      } else {
        return (
          <button
            key={node.id}
            onClick={() => setSelectedApiId(node.apiId!)}
            className={`w-full text-left px-2 py-1 hover:bg-white transition-all flex items-center gap-2 border-l-2 ${
              selectedApiId === node.apiId ? 'bg-white border-blue-600 shadow-sm' : 'border-transparent'
            }`}
            style={{ paddingLeft: `${level * 12 + 24}px` }}
          >
            <span className={`text-[8px] font-bold px-1 py-0.5 rounded border shrink-0 min-w-[32px] text-center ${
              node.method === 'GET' ? 'text-blue-600 border-blue-100 bg-blue-50' :
              node.method === 'POST' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
              'text-slate-600 border-slate-100 bg-slate-50'
            }`}>
              {node.method}
            </span>
            <span className={`text-[11px] truncate ${selectedApiId === node.apiId ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
              {node.name}
            </span>
          </button>
        );
      }
    });
  };

  const proxyOptions = [
    'https://api.production.com',
    'https://api.staging.com',
    'http://localhost:8080',
    'https://mock-server.dev'
  ];

  const selectedApi = MOCK_APIS.find(api => api.id === selectedApiId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Debugged': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'To Test': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const tabs = [
    { id: 'headers', label: t('tabsHeaders'), icon: ShieldCheck },
    { id: 'params', label: t('tabsParams'), icon: ListFilter },
    { id: 'responseHeaders', label: t('tabsResponseHeaders'), icon: FileJson },
    { id: 'response', label: t('tabsResponse'), icon: Braces },
    { id: 'mock', label: t('tabsMock'), icon: Zap },
  ];

  const SchemaRow: React.FC<{ name: string; type: string; required: boolean; desc: string; depth?: number }> = ({ name, type, required, desc, depth = 0 }) => (
    <tr className="hover:bg-slate-50/50 group">
      <td className="px-3 py-1.5">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
          {type === 'object' || type === 'array' ? <ChevronDown size={12} className="text-slate-400" /> : <div className="w-3" />}
          <input type="text" defaultValue={name} className="bg-transparent outline-none text-slate-900 font-mono text-xs w-full" />
        </div>
      </td>
        <td className="px-3 py-1.5">
          <SelectableInput
            options={['string', 'number', 'boolean', 'object', 'array', 'integer']}
            value={type}
            onChange={() => {}}
            allowCustom={false}
            showSearch={false}
            size="sm"
            inputClassName="bg-slate-100 border-none rounded"
            className="w-24"
          />
        </td>
      <td className="px-3 py-1.5 text-center">
        <input type="checkbox" defaultChecked={required} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
      </td>
      <td className="px-3 py-1.5">
        <input
          type="text"
          defaultValue={desc}
          placeholder={t('schemaDescription')}
          className="w-full bg-transparent outline-none text-slate-400 italic text-xs"
        />
      </td>
      <td className="px-3 py-1.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 text-slate-300 hover:text-rose-500"><Trash2 size={12} /></button>
      </td>
    </tr>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'params':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('schemaQueryTitle')}
                </h5>
                <button className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                  <Plus size={12} /> {t('schemaAddField')}
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-1/3">
                        {t('schemaFieldName')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-24">
                        {t('schemaType')}
                      </th>
                      <th className="px-3 py-1.5 text-center font-bold text-slate-500 w-20">
                        {t('schemaRequired')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500">
                        {t('schemaDescription')}
                      </th>
                      <th className="px-3 py-1.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <SchemaRow name="page" type="integer" required={true} desc="Page number" />
                    <SchemaRow name="limit" type="integer" required={false} desc="Items per page" />
                    <SchemaRow name="filter" type="string" required={false} desc="Search filter" />
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('schemaBodyTitle')}
                </h5>
                <button className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                  <Plus size={12} /> {t('schemaAddField')}
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-1/3">
                        {t('schemaFieldName')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-24">
                        {t('schemaType')}
                      </th>
                      <th className="px-3 py-1.5 text-center font-bold text-slate-500 w-20">
                        {t('schemaRequired')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500">
                        {t('schemaDescription')}
                      </th>
                      <th className="px-3 py-1.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <SchemaRow name="user" type="object" required={true} desc="User information" />
                    <SchemaRow name="id" type="string" required={true} desc="User unique ID" depth={1} />
                    <SchemaRow name="name" type="string" required={true} desc="Display name" depth={1} />
                    <SchemaRow name="email" type="string" required={false} desc="Contact email" depth={1} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'headers':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('headersRequestTitle')}
              </h5>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-1/3">
                        {t('headersKey')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-1/3">
                        {t('headersValue')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500">
                        {t('schemaDescription')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: 'Content-Type', value: 'application/json', desc: 'Media type of the resource' },
                      { key: 'Authorization', value: 'Bearer {{token}}', desc: 'Authentication token' },
                      { key: 'x-mock-key', value: 'mk_live_8821_99x2z', desc: 'Platform identification key' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-slate-900">{row.key}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{row.value}</td>
                        <td className="px-3 py-1.5 text-slate-400 italic">{row.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'responseHeaders':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('responseHeadersTitle')}
              </h5>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-1/3">
                        {t('headersKey')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500">
                        {t('headersValue')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { key: 'Content-Type', value: 'application/json; charset=utf-8' },
                      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
                      { key: 'x-powered-by', value: 'MockDev-Engine/1.0' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-1.5 font-mono text-slate-900">{row.key}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'response':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('responseSchemaTitle')}
                </h5>
                <button className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={12} /> {t('schemaAddField')}
                </button>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500">
                        {t('responseSchemaField')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-20">
                        {t('schemaType')}
                      </th>
                      <th className="px-3 py-1.5 text-left font-bold text-slate-500">
                        {t('responseSchemaDescShort')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <SchemaRow name="status" type="string" required={true} desc="Response status" />
                    <SchemaRow name="data" type="object" required={true} desc="Payload" />
                    <SchemaRow name="id" type="string" required={true} desc="User ID" depth={1} />
                    <SchemaRow name="name" type="string" required={true} desc="User Name" depth={1} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'mock':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setResponseMode('static')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${responseMode === 'static' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <FileJson size={14} />
                  {t('mockStaticPreviewTitle')}
                </button>
                <button 
                  onClick={() => setResponseMode('script')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${responseMode === 'script' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Terminal size={14} />
                  {t('responseModeScript')}
                </button>
              </div>
              
              {responseMode === 'proxy' && (
                <div className="flex items中心 gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <AlertCircle size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {t('mockProxyBadge')}
                  </span>
                </div>
              )}
            </div>

            {responseMode === 'proxy' ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl mb-3">
                  <Server size={28} />
                </div>
                <h4 className="text-base font-bold text-slate-900">{t('mockProxyTitle')}</h4>
                <p className="text-xs text-slate-500 max-w-sm text-center mt-1.5">
                  {t('mockProxyDesc')}{' '}
                  <span className="font-mono text-blue-600 font-bold">{proxyUrl}</span>.
                </p>
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => setResponseMode('static')}
                    className="px-5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    {t('mockProxySwitchToMock')}
                  </button>
                  <button className="flex items-center gap-2 px-5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    <Zap size={14} />
                    {t('mockProxyRun')}
                  </button>
                </div>
              </div>
            ) : responseMode === 'static' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('mockStaticPreviewTitle')}
                  </h5>
                  <div className="flex gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200"><Copy size={12} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200"><Braces size={12} /></button>
                  </div>
                </div>
                <pre className="w-full h-80 bg-slate-900 rounded-2xl p-4 text-emerald-300 font-mono text-[11px] overflow-auto leading-relaxed border border-slate-800 shadow-inner">
                  {JSON.stringify({
                    status: "success",
                    data: {
                      id: "user_9921",
                      name: "John Doe"
                    }
                  }, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('mockDynamicTitle')}
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                      <Zap size={10} /> {t('mockDynamicLive')}
                    </span>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute top-3 right-3 z-10 flex gap-2">
                    <button className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg">
                      <Copy size={12} />
                    </button>
                    <button className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg">
                      <Save size={12} />
                    </button>
                  </div>
                  <pre className="w-full h-96 bg-slate-900 rounded-2xl p-4 text-blue-200 font-mono text-xs overflow-auto leading-relaxed border border-slate-800 shadow-inner">
{`/**
 * @param {Request} req - Incoming request
 * @param {Response} res - Response helper
 */
export default function(req, res) {
  const { id } = req.query;
  
  // Logic based on input
  if (id === 'test') {
    return res.status(200).json({
      mode: "test_active",
      mocked: true
    });
  }

  // Simulate network latency
  res.delay(200);

  return res.json({
    id: id || "anon_0",
    timestamp: Date.now(),
    data: {
      status: "online",
      version: "v2"
    }
  });
}`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
        <div className="flex h-[calc(100vh-160px)] -m-6 bg-white border-t border-slate-200">
      {/* Left Sidebar: API List */}
      <div className="w-64 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-2 border-b border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t('interfacesTitle')}
            </h3>
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List size={12} />
              </button>
              <button 
                onClick={() => setViewMode('tree')}
                className={`p-1 rounded-md transition-all ${viewMode === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tree View"
              >
                <FolderTree size={12} />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder={t('interfacesSearchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={14} />
            {t('interfacesNew')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' || searchQuery ? (
            <div className="divide-y divide-slate-100">
              {MOCK_APIS.filter(api => api.name.toLowerCase().includes(searchQuery.toLowerCase()) || api.path.toLowerCase().includes(searchQuery.toLowerCase())).map((api) => (
                <button
                  key={api.id}
                  onClick={() => setSelectedApiId(api.id)}
                  className={`w-full text-left p-2 hover:bg-white transition-all flex flex-col gap-0.5 border-l-2 ${
                    selectedApiId === api.id ? 'bg-white border-blue-600 shadow-sm' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      api.method === 'GET' ? 'text-blue-600 border-blue-100 bg-blue-50' :
                      api.method === 'POST' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                      'text-slate-600 border-slate-100 bg-slate-50'
                    }`}>
                      {api.method}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{api.lastCall}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs truncate">{api.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">{api.path}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-1">
              {renderTree(buildApiTree(MOCK_APIS))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Detail & Editor */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedApi ? (
          <>
            {/* Detail Header */}
            <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedApi.status)}`}>
                  {selectedApi.status}
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={12} />
                  <span className="text-[11px]">{t('interfaceUpdatedAgo')}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Settings2 size={16} />
                </button>
                <button className="flex items-center gap-2 bg-blue-600 text白 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10">
                  <Save size={14} />
                  {t('interfaceSaveChanges')}
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {/* Basic Info Section */}
              <section className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900">
                  <Info size={14} className="text-blue-600" />
                  <h4 className="text-[10px] font-bold uppercase tracking-widest">Basic Information</h4>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                  <div className="lg:col-span-4 space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Interface Name</label>
                    <input 
                      type="text" 
                      defaultValue={selectedApi.name}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  <div className="lg:col-span-8 space-y-0.5">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Endpoint Path</label>
                    <div className="flex h-7">
                      <div className="w-20 shrink-0">
                        <SelectableInput
                          options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']}
                          value={selectedApi.method}
                          onChange={() => {}}
                          allowCustom={false}
                          showSearch={false}
                          size="sm"
                          inputClassName="rounded-l-lg rounded-r-none border-r-0 bg-slate-100 text-slate-600 font-bold text-[10px]"
                          className="h-full"
                        />
                      </div>
                      <span className="inline-flex items-center px-2 border-y border-slate-200 bg-slate-50 text-slate-400 text-[10px] font-mono">
                        /api/v1
                      </span>
                      <input 
                        type="text" 
                        defaultValue={selectedApi.path.replace('/api/v1', '')}
                        className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-r-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-2 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 shrink-0 ml-1">
                    <Zap size={12} className="text-blue-600" />
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Response Mode</label>
                  </div>
                  
                  <div className="flex flex-1 flex-col lg:flex-row gap-2">
                    <div className="w-full lg:w-40">
                      <SelectableInput
                        options={['Static Mock', 'Dynamic Script', 'Real Proxy']}
                        value={responseMode === 'static' ? 'Static Mock' : responseMode === 'script' ? 'Dynamic Script' : 'Real Proxy'}
                        onChange={(val) => {
                          if (val === 'Static Mock') setResponseMode('static');
                          else if (val === 'Dynamic Script') setResponseMode('script');
                          else if (val === 'Real Proxy') setResponseMode('proxy');
                        }}
                        allowCustom={false}
                        showSearch={false}
                        size="sm"
                        inputClassName="text-slate-700 font-bold shadow-sm text-[10px]"
                      />
                    </div>

                    {responseMode === 'proxy' && (
                      <div className="flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                        <SelectableInput 
                          options={proxyOptions}
                          value={proxyUrl}
                          onChange={setProxyUrl}
                          size="sm"
                          placeholder="Select or enter target URL..."
                          inputClassName="text-[10px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100" />

              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-200 -mx-2 px-2 bg-slate-50/30">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all border-b-2 -mb-px ${
                      activeTab === tab.id 
                        ? 'text-blue-600 border-blue-600 bg-white' 
                        : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                  >
                    <tab.icon size={12} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-0.5">
                {renderTabContent()}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
            <div className="p-6 bg-slate-50 rounded-full">
              <Code2 size={48} className="text-slate-200" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-900">{t('mockNoSelectionTitle')}</p>
              <p className="text-xs">{t('mockNoSelectionDesc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiTable;
