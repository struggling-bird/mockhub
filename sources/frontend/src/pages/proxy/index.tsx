import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, Save, Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { ProxyGroup } from '../../types';
import { request } from '../../utils/http';

const emptyForm = {
  id: '',
  name: '',
  regex: '^/api/.*',
  mode: 'Hybrid' as ProxyGroup['mode'],
  targetUrl: '',
  priority: 100,
  enabled: true,
  autoCapture: true,
};

const modes: ProxyGroup['mode'][] = ['Hybrid', 'Proxy', 'Mock'];

const ProxyConfig: React.FC = () => {
  const { t } = useLanguage();
  const projectId = window.localStorage.getItem('mockhub_project_id');
  const [groups, setGroups] = useState<ProxyGroup[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const gatewayUrl = useMemo(() => `${window.location.origin}/gateway`, []);

  const loadGroups = async () => {
    if (!projectId) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await request<ProxyGroup[]>(`/api/projects/${projectId}/proxy-groups`);
      setGroups(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('proxyLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const resetForm = () => setForm(emptyForm);

  const editGroup = (group: ProxyGroup) => {
    setForm({
      id: group.id,
      name: group.name,
      regex: group.regex,
      mode: group.mode,
      targetUrl: group.targetUrl || '',
      priority: group.priority,
      enabled: group.enabled,
      autoCapture: group.autoCapture,
    });
  };

  const saveGroup = async () => {
    if (!projectId || saving) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        regex: form.regex,
        mode: form.mode,
        targetUrl: form.targetUrl || null,
        priority: Number(form.priority),
        enabled: form.enabled,
        autoCapture: form.autoCapture,
      };
      const data = await request<ProxyGroup[]>(
        form.id
          ? `/api/projects/${projectId}/proxy-groups/${form.id}`
          : `/api/projects/${projectId}/proxy-groups`,
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      setGroups(data);
      resetForm();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('proxySaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (group: ProxyGroup) => {
    if (!projectId || saving) return;
    if (!window.confirm(t('proxyDeleteConfirm'))) return;
    setSaving(true);
    try {
      const data = await request<ProxyGroup[]>(
        `/api/projects/${projectId}/proxy-groups/${group.id}`,
        { method: 'DELETE' },
      );
      setGroups(data);
      if (form.id === group.id) resetForm();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('proxySaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = async (group: ProxyGroup) => {
    if (!projectId || saving) return;
    setSaving(true);
    try {
      const data = await request<ProxyGroup[]>(
        `/api/projects/${projectId}/proxy-groups/${group.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...group, enabled: !group.enabled }),
        },
      );
      setGroups(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('proxySaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const copyGatewayUrl = async () => {
    await navigator.clipboard.writeText(gatewayUrl).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t('proxyGroupsTitle')}</h2>
          <p className="text-xs text-slate-500">{t('proxyGroupsDesc')}</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex h-8 items-center gap-2 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
        >
          <Plus size={14} />
          {t('proxyGroupsAdd')}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {error}
        </div>
      ) : null}
      {copied ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {t('proxyCopied')}
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-12">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:col-span-2"
            placeholder={t('proxyGroupName')}
          />
          <input
            value={form.regex}
            onChange={(event) => setForm((prev) => ({ ...prev, regex: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:col-span-3"
            placeholder={t('proxyRegex')}
          />
          <select
            value={form.mode}
            onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value as ProxyGroup['mode'] }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs cursor-pointer lg:col-span-1"
          >
            {modes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select>
          <input
            value={form.targetUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, targetUrl: event.target.value }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:col-span-3"
            placeholder={t('proxyTargetUrl')}
          />
          <input
            type="number"
            value={form.priority}
            onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value) }))}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:col-span-1"
            placeholder={t('proxyPriority')}
          />
          <button
            type="button"
            onClick={saveGroup}
            disabled={saving || !form.name.trim() || !form.regex.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 cursor-pointer lg:col-span-2"
          >
            <Save size={14} />
            {form.id ? t('saveUpdateProject') : t('saveCreateProject')}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(event) => setForm((prev) => ({ ...prev, enabled: event.target.checked }))}
            />
            {t('proxyEnabled')}
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.autoCapture}
              onChange={(event) => setForm((prev) => ({ ...prev, autoCapture: event.target.checked }))}
            />
            {t('proxyAutoCapture')}
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
          <div className="col-span-3">{t('proxyGroupName')}</div>
          <div className="col-span-3">{t('proxyRegex')}</div>
          <div className="col-span-1">{t('proxyMode')}</div>
          <div className="col-span-2">{t('proxyTargetUrl')}</div>
          <div className="col-span-1">{t('proxyPriority')}</div>
          <div className="col-span-2 text-right">{t('publicAssetsColumnActions')}</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('proxyLoading')}</div>
        ) : groups.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {groups.map((group) => (
              <div key={group.id} className="grid grid-cols-12 items-center gap-3 px-3 py-2 hover:bg-slate-50">
                <div className="col-span-12 md:col-span-3">
                  <div className="text-xs font-semibold text-slate-900">{group.name}</div>
                  <div className="mt-1 flex gap-2 text-[10px] text-slate-400">
                    <span>{group.enabled ? t('proxyEnabled') : t('proxyDisabled')}</span>
                    <span>{group.autoCapture ? t('proxyAutoCapture') : t('proxyManualCapture')}</span>
                  </div>
                </div>
                <div className="col-span-12 truncate rounded border border-slate-100 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500 md:col-span-3">
                  {group.regex}
                </div>
                <div className="col-span-3 text-xs font-semibold text-slate-700 md:col-span-1">{group.mode}</div>
                <div className="col-span-6 truncate text-[11px] text-slate-500 md:col-span-2">{group.targetUrl || '-'}</div>
                <div className="col-span-3 text-xs text-slate-500 md:col-span-1">{group.priority}</div>
                <div className="col-span-12 flex justify-end gap-2 md:col-span-2">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    disabled={saving}
                    className="rounded border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {group.enabled ? t('proxyDisable') : t('proxyEnable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => editGroup(group)}
                    className="rounded border border-blue-100 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 cursor-pointer"
                  >
                    {t('editProject')}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteGroup(group)}
                    disabled={saving}
                    className="inline-flex items-center gap-1 rounded border border-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 size={12} />
                    {t('teamDeleteRole')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">{t('proxyEmpty')}</div>
        )}
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-600 p-4 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold">{t('proxyGlobalTitle')}</h3>
            <p className="mt-1 text-xs text-blue-100">
              {t('proxyGlobalDesc')} <span className="font-mono font-bold">{gatewayUrl}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={copyGatewayUrl}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-white/20 px-3 text-xs font-bold text-white hover:bg-white/30 cursor-pointer"
          >
            <Copy size={14} />
            {t('proxyCopyUrl')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProxyConfig;
