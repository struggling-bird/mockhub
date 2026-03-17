import React from 'react';
import {
  AlertCircle,
  Braces,
  Copy,
  FileJson,
  Plus,
  Save,
  Server,
  Terminal,
  Zap,
} from 'lucide-react';
import type { ApiHeaderRow, ApiMockMode, ApiSchemaRow } from '../../types';
import SchemaRow from './SchemaRow';

interface ApiTabContentProps {
  activeTab: string;
  t: (key: string) => string;
  requestHeaders: ApiHeaderRow[];
  setRequestHeaders: React.Dispatch<React.SetStateAction<ApiHeaderRow[]>>;
  responseHeaders: ApiHeaderRow[];
  setResponseHeaders: React.Dispatch<React.SetStateAction<ApiHeaderRow[]>>;
  requestParams: ApiSchemaRow[];
  setRequestParams: React.Dispatch<React.SetStateAction<ApiSchemaRow[]>>;
  responseSchema: ApiSchemaRow[];
  setResponseSchema: React.Dispatch<React.SetStateAction<ApiSchemaRow[]>>;
  responseMode: ApiMockMode;
  setResponseMode: (value: ApiMockMode) => void;
  proxyUrl: string;
  mockStaticBody: string;
  setMockStaticBody: (value: string) => void;
  mockScript: string;
  setMockScript: (value: string) => void;
  addRequestHeader: () => void;
  addResponseHeader: () => void;
  addQueryParamField: () => void;
  addBodyField: () => void;
  addResponseField: () => void;
}

const ApiTabContent: React.FC<ApiTabContentProps> = ({
  activeTab,
  t,
  requestHeaders,
  setRequestHeaders,
  responseHeaders,
  setResponseHeaders,
  requestParams,
  setRequestParams,
  responseSchema,
  setResponseSchema,
  responseMode,
  setResponseMode,
  proxyUrl,
  mockStaticBody,
  setMockStaticBody,
  mockScript,
  setMockScript,
  addRequestHeader,
  addResponseHeader,
  addQueryParamField,
  addBodyField,
  addResponseField,
}) => {
  switch (activeTab) {
    case 'params':
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('schemaQueryTitle')}
              </h5>
              <button
                type="button"
                onClick={addQueryParamField}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
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
                  {requestParams.map((row, index) =>
                    row.section === 'query' ? (
                      <SchemaRow
                        key={`query-${index}`}
                        row={row}
                        onChange={(next) => {
                          const list = [...requestParams];
                          list[index] = next;
                          setRequestParams(list);
                        }}
                        onDelete={() => {
                          setRequestParams(requestParams.filter((_, i) => i !== index));
                        }}
                        descriptionPlaceholder={t('schemaDescription')}
                      />
                    ) : null,
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('schemaBodyTitle')}
              </h5>
              <button
                type="button"
                onClick={addBodyField}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
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
                  {requestParams.map((row, index) =>
                    row.section === 'body' ? (
                      <SchemaRow
                        key={`body-${index}`}
                        row={row}
                        onChange={(next) => {
                          const list = [...requestParams];
                          list[index] = next;
                          setRequestParams(list);
                        }}
                        onDelete={() => {
                          setRequestParams(requestParams.filter((_, i) => i !== index));
                        }}
                        descriptionPlaceholder={t('schemaDescription')}
                      />
                    ) : null,
                  )}
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
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('headersRequestTitle')}
              </h5>
              <button
                type="button"
                onClick={addRequestHeader}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                <Plus size={12} /> {t('schemaAddField')}
              </button>
            </div>
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
                  {requestHeaders.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="px-3 py-1.5 font-mono text-slate-900">
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => {
                            const list = [...requestHeaders];
                            list[index] = { ...row, key: e.target.value };
                            setRequestHeaders(list);
                          }}
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5 font-mono text-slate-600">
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const list = [...requestHeaders];
                            list[index] = { ...row, value: e.target.value };
                            setRequestHeaders(list);
                          }}
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5 text-slate-400 italic">
                        <input
                          type="text"
                          value={row.desc || ''}
                          onChange={(e) => {
                            const list = [...requestHeaders];
                            list[index] = { ...row, desc: e.target.value };
                            setRequestHeaders(list);
                          }}
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </td>
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
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('responseHeadersTitle')}
              </h5>
              <button
                type="button"
                onClick={addResponseHeader}
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                <Plus size={12} /> {t('schemaAddField')}
              </button>
            </div>
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
                  {responseHeaders.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="px-3 py-1.5 font-mono text-slate-900">
                        <input
                          type="text"
                          value={row.key}
                          onChange={(e) => {
                            const list = [...responseHeaders];
                            list[index] = { ...row, key: e.target.value };
                            setResponseHeaders(list);
                          }}
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </td>
                      <td className="px-3 py-1.5 font-mono text-slate-600">
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const list = [...responseHeaders];
                            list[index] = { ...row, value: e.target.value };
                            setResponseHeaders(list);
                          }}
                          className="w-full bg-transparent outline-none text-xs"
                        />
                      </td>
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
              <button
                type="button"
                onClick={addResponseField}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
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
                    <th className="px-3 py-1.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {responseSchema.map((row, index) => (
                    <SchemaRow
                      key={`response-${index}`}
                      row={row}
                      onChange={(next) => {
                        const list = [...responseSchema];
                        list[index] = next;
                        setResponseSchema(list);
                      }}
                      onDelete={() => {
                        setResponseSchema(responseSchema.filter((_, i) => i !== index));
                      }}
                      descriptionPlaceholder={t('schemaDescription')}
                    />
                  ))}
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
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  responseMode === 'static'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileJson size={14} />
                {t('mockStaticPreviewTitle')}
              </button>
              <button
                onClick={() => setResponseMode('script')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  responseMode === 'script'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Terminal size={14} />
                {t('responseModeScript')}
              </button>
            </div>

            {responseMode === 'proxy' && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
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
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200">
                    <Copy size={12} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200">
                    <Braces size={12} />
                  </button>
                </div>
              </div>
              <textarea
                spellCheck={false}
                className="w-full h-80 bg-slate-900 rounded-2xl p-4 text-emerald-300 font-mono text-[11px] overflow-auto leading-relaxed border border-slate-800 shadow-inner focus:outline-none"
                value={mockStaticBody}
                onChange={(e) => setMockStaticBody(e.target.value)}
              />
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
                <textarea
                  spellCheck={false}
                  className="w-full h-96 bg-slate-900 rounded-2xl p-4 text-blue-200 font-mono text-xs overflow-auto leading-relaxed border border-slate-800 shadow-inner focus:outline-none"
                  value={mockScript}
                  onChange={(e) => setMockScript(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default ApiTabContent;
