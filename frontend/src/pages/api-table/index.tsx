import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Plus, MoreVertical, Code2, ChevronRight, ChevronDown, Globe, Clock, Settings2, Trash2,
  Save, X, ShieldCheck, Zap, Database, ListFilter, Braces, FileJson, Folder, FolderTree, List
} from 'lucide-react';
import type { ApiItem, ApiHeaderRow, ApiSchemaRow, ApiMockMode } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { formatLastCall } from '../../utils/relativeTime';
import { request } from '../../utils/http';
import ApiBasicInfoSection from './ApiBasicInfoSection';
import ApiTabContent from './ApiTabContent';

const ApiTable: React.FC = () => {
  const projectId = window.localStorage.getItem('mockhub_project_id');
  const [apis, setApis] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPath, setEditPath] = useState('/api/v1');
  const [editMethod, setEditMethod] = useState<ApiItem['method']>('GET');
  const [editStatus, setEditStatus] = useState<ApiItem['status']>('New');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('headers');
  const [responseMode, setResponseMode] = useState<ApiMockMode>('static');
  const [proxyUrl, setProxyUrl] = useState('https://api.production.com');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/api', '/api/v1']));
  const { t } = useLanguage();

  const [detail, setDetail] = useState<ApiItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // headers / schema 本地可编辑 state
  const [requestHeaders, setRequestHeaders] = useState<ApiHeaderRow[]>([]);
  const [responseHeaders, setResponseHeaders] = useState<ApiHeaderRow[]>([]);
  const [requestParams, setRequestParams] = useState<ApiSchemaRow[]>([]);
  const [responseSchema, setResponseSchema] = useState<ApiSchemaRow[]>([]);
  const [mockStaticBody, setMockStaticBody] = useState<string>('');
  const [mockScript, setMockScript] = useState<string>('');

  const fetchApis = useCallback(async () => {
    if (!projectId) {
      setApis([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await request<
        (Omit<ApiItem, 'lastCall'> & { lastCall: string })[]
      >(`/api/projects/${projectId}/apis`);
      setApis(
        data.map((a) => ({
          ...a,
          lastCall: formatLastCall(a.lastCall) || t('lastCallNever'),
        })),
      );
      setSelectedApiId((prev) =>
        prev && data.some((d) => d.id === prev) ? prev : data[0]?.id ?? null,
      );
    } catch {
      setApis([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    fetchApis();
  }, [fetchApis]);

  const selectedApi = apis.find((a) => a.id === selectedApiId);
  useEffect(() => {
    if (!selectedApi || !projectId) {
      setDetail(null);
      return;
    }
    const loadDetail = async () => {
      setDetailLoading(true);
      try {
        const data = await request<ApiItem>(
          `/api/projects/${projectId}/apis/${selectedApi.id}`,
        );
        setDetail(data);
        setEditName(data.name);
        setEditPath(data.path || '');
        setEditMethod(data.method);
        setEditStatus(data.status);
        setResponseMode((data.mockMode as ApiMockMode) || 'static');
        setProxyUrl(
          data.mockProxyUrl || 'https://api.production.com',
        );
        setRequestHeaders(data.requestHeaders || []);
        setResponseHeaders(data.responseHeaders || []);
        setRequestParams(data.requestParams || []);
        setResponseSchema(data.responseSchema || []);
        setMockStaticBody(
          data.mockStaticBody ||
            JSON.stringify(
              {
                status: 'success',
                data: {
                  id: 'user_9921',
                  name: 'John Doe',
                },
              },
              null,
              2,
            ),
        );
        setMockScript(
          data.mockScript ||
            `/**
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
}`,
        );
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();
  }, [projectId, selectedApi?.id]);

  const handleSave = async () => {
    if (!selectedApi || !projectId) return;
    setSaving(true);
    try {
      await request(`/api/projects/${projectId}/apis/${selectedApi.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          path: editPath || '/',
          method: editMethod,
          status: editStatus,
          requestHeaders,
          requestParams,
          responseHeaders,
          responseSchema,
          mockStaticBody,
          mockScript,
          mockMode: responseMode,
          mockProxyUrl: proxyUrl,
        }),
      });
      await fetchApis();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApi || !projectId) return;
    if (!window.confirm(t('interfaceSaveChanges') ? 'Delete this interface?' : '确定删除该接口？')) return;
    try {
      await request(`/api/projects/${projectId}/apis/${selectedApi.id}`, {
        method: 'DELETE',
      });
      const next = apis.filter((a) => a.id !== selectedApi.id);
      setApis(next);
      setSelectedApiId(next[0]?.id ?? null);
    } catch {
      // ignore
    }
  };

  const handleCreate = async () => {
    if (!projectId) return;
    try {
      const created = await request<ApiItem>(`/api/projects/${projectId}/apis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Interface',
          path: '/api/v1',
          method: 'GET',
        }),
      });
      setApis((prev) => [{ ...created }, ...prev]);
      setSelectedApiId(created.id);
    } catch {
      // ignore
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const addRequestHeader = () => {
    setRequestHeaders((prev) => [...prev, { key: '', value: '', desc: '' }]);
  };

  const addResponseHeader = () => {
    setResponseHeaders((prev) => [...prev, { key: '', value: '', desc: '' }]);
  };

  const addQueryParamField = () => {
    setRequestParams((prev) => [
      ...prev,
      {
        name: 'newQueryField',
        type: 'string',
        required: false,
        desc: '',
        section: 'query',
      },
    ]);
  };

  const addBodyField = () => {
    setRequestParams((prev) => [
      ...prev,
      {
        name: 'newBodyField',
        type: 'string',
        required: false,
        desc: '',
        section: 'body',
      },
    ]);
  };

  const addResponseField = () => {
    setResponseSchema((prev) => [
      ...prev,
      {
        name: 'newField',
        type: 'string',
        required: false,
        desc: '',
        section: 'response',
      },
    ]);
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
              className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
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
            className={`w-full text-left px-2 py-1 hover:bg-white transition-all flex items-center gap-2 border-l-2 cursor-pointer ${
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

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Code2 size={48} className="text-slate-200 mb-4" />
        <p className="font-semibold text-slate-700">{t('apisNoProject')}</p>
        <p className="text-sm mt-1">{t('apisSelectProject')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        <span className="text-sm">{t('apisLoading')}</span>
      </div>
    );
  }

  return (
        <div className="flex h-[calc(100vh-80px)] -m-6 bg-white border-t border-slate-200">
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
                className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <List size={12} />
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'tree' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
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
          <button
            type="button"
            onClick={handleCreate}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            {t('interfacesNew')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {viewMode === 'list' || searchQuery ? (
            <div className="divide-y divide-slate-100">
              {apis.filter(api => api.name.toLowerCase().includes(searchQuery.toLowerCase()) || api.path.toLowerCase().includes(searchQuery.toLowerCase())).map((api) => (
                <button
                  key={api.id}
                  onClick={() => setSelectedApiId(api.id)}
                  className={`w-full text-left p-2 hover:bg-white transition-all flex flex-col gap-0.5 border-l-2 cursor-pointer ${
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
                    <span className="text-[10px] text-slate-400 font-medium">{api.lastCall || t('lastCallNever')}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-xs truncate">{api.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">{api.path}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-1">
              {apis.length === 0 ? (
                <div className="p-3 text-center text-slate-400 text-xs">
                  <p className="font-medium">{t('apisEmpty')}</p>
                  <p className="mt-1">{t('apisEmptyHint')}</p>
                </div>
              ) : (
                renderTree(buildApiTree(apis))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Content: Detail & Editor */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedApi ? (
          <>
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
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                  <Settings2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 disabled:opacity-60 cursor-pointer"
                >
                  <Save size={14} />
                  {saving ? (t('apisLoading') as string) : t('interfaceSaveChanges')}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <ApiBasicInfoSection
                t={t}
                editName={editName}
                setEditName={setEditName}
                editPath={editPath}
                setEditPath={setEditPath}
                editMethod={editMethod}
                setEditMethod={setEditMethod}
                responseMode={responseMode}
                setResponseMode={setResponseMode}
                proxyUrl={proxyUrl}
                setProxyUrl={setProxyUrl}
                proxyOptions={proxyOptions}
              />

              <div className="h-px bg-slate-100" />

              <div className="flex border-b border-slate-200 -mx-2 px-2 bg-slate-50/30">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold transition-all border-b-2 -mb-px cursor-pointer ${
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
                <ApiTabContent
                  activeTab={activeTab}
                  t={t}
                  requestHeaders={requestHeaders}
                  setRequestHeaders={setRequestHeaders}
                  responseHeaders={responseHeaders}
                  setResponseHeaders={setResponseHeaders}
                  requestParams={requestParams}
                  setRequestParams={setRequestParams}
                  responseSchema={responseSchema}
                  setResponseSchema={setResponseSchema}
                  responseMode={responseMode}
                  setResponseMode={setResponseMode}
                  proxyUrl={proxyUrl}
                  mockStaticBody={mockStaticBody}
                  setMockStaticBody={setMockStaticBody}
                  mockScript={mockScript}
                  setMockScript={setMockScript}
                  addRequestHeader={addRequestHeader}
                  addResponseHeader={addResponseHeader}
                  addQueryParamField={addQueryParamField}
                  addBodyField={addBodyField}
                  addResponseField={addResponseField}
                />
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
