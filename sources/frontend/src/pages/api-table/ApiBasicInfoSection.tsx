import React from 'react';
import { Info, LoaderCircle, Send, Zap } from 'lucide-react';
import type { ApiItem, ApiMockMode } from '../../types';
import SelectableInput from '../../components/SelectableInput';

interface ApiBasicInfoSectionProps {
  t: (key: string) => string;
  editName: string;
  setEditName: (value: string) => void;
  editPath: string;
  setEditPath: (value: string) => void;
  editMethod: ApiItem['method'];
  setEditMethod: (value: ApiItem['method']) => void;
  responseMode: ApiMockMode;
  setResponseMode: (value: ApiMockMode) => void;
  proxyUrl: string;
  setProxyUrl: (value: string) => void;
  proxyOptions: string[];
  onSendProxyRequest: () => void;
  proxyRequestLoading: boolean;
}

const ApiBasicInfoSection: React.FC<ApiBasicInfoSectionProps> = ({
  t,
  editName,
  setEditName,
  editPath,
  setEditPath,
  editMethod,
  setEditMethod,
  responseMode,
  setResponseMode,
  proxyUrl,
  setProxyUrl,
  proxyOptions,
  onSendProxyRequest,
  proxyRequestLoading,
}) => {
  return (
    <section className="space-y-1.5">
      <div className="flex items-center gap-2 text-slate-900">
        <Info size={14} className="text-blue-600" />
        <h4 className="text-[10px] font-bold uppercase tracking-widest">
          {t('basicInfoTitle')}
        </h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-4 space-y-0.5">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {t('interfaceNameLabel')}
          </label>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="lg:col-span-8 space-y-0.5">
          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {t('endpointPathLabel')}
          </label>
          <div className="flex h-7 gap-1.5">
            <div className="w-24 shrink-0">
              <SelectableInput
                options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']}
                value={editMethod}
                onChange={(val) => setEditMethod(val as ApiItem['method'])}
                allowCustom={false}
                showSearch={false}
                size="sm"
                inputClassName="rounded-lg bg-slate-100 text-slate-600 font-bold text-[10px]"
                className="h-full"
              />
            </div>
            <input
              type="text"
              value={editPath}
              onChange={(e) => setEditPath(e.target.value)}
              className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              placeholder="/api/v1/your-path"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-2 bg-slate-50/50 p-1 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2 shrink-0 ml-1">
          <Zap size={12} className="text-blue-600" />
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            {t('responseModeLabel')}
          </label>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row gap-2">
          <div className="w-full lg:w-40">
            <SelectableInput
              options={[
                t('responseModeStatic'),
                t('responseModeScript'),
                t('responseModeProxy'),
              ]}
              value={
                responseMode === 'static'
                  ? t('responseModeStatic')
                  : responseMode === 'script'
                    ? t('responseModeScript')
                    : t('responseModeProxy')
              }
              onChange={(val) => {
                if (val === t('responseModeStatic')) setResponseMode('static');
                else if (val === t('responseModeScript')) setResponseMode('script');
                else if (val === t('responseModeProxy')) setResponseMode('proxy');
              }}
              allowCustom={false}
              showSearch={false}
              size="sm"
              inputClassName="text-slate-700 font-bold shadow-sm text-[10px]"
            />
          </div>

          {responseMode === 'proxy' && (
            <div className="flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SelectableInput
                    options={proxyOptions}
                    value={proxyUrl}
                    onChange={setProxyUrl}
                    size="sm"
                    placeholder={t('proxyUrlSelectPlaceholder')}
                    inputClassName="text-[10px]"
                  />
                </div>
                <button
                  type="button"
                  onClick={onSendProxyRequest}
                  disabled={proxyRequestLoading}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {proxyRequestLoading ? (
                    <LoaderCircle size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  {proxyRequestLoading ? t('mockProxySending') : t('mockProxySend')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ApiBasicInfoSection;
