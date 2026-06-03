import React, { useEffect, useMemo, useState } from 'react';
import {
  Braces,
  Copy,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Link2,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import type { AssetSuggestion, PublicAsset } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { request } from '../../utils/http';

type AssetType = 'URL' | 'ErrorCode' | 'Enum' | 'JSON' | 'Text';

interface AssetForm {
  id?: string;
  name: string;
  type: AssetType;
  category: string;
  urlValue: string;
  errorItems: { code: string; message: string }[];
  enumItems: string[];
  jsonValue: string;
  textValue: string;
}

const typeOptions: {
  type: AssetType;
  labelKey: string;
  category: string;
  categoryKey: string;
  icon: React.ComponentType<{ size?: number }>;
}[] = [
  {
    type: 'URL',
    labelKey: 'publicAssetsTypeUrl',
    category: 'Infrastructure',
    categoryKey: 'assetsCategoryInfrastructure',
    icon: Link2,
  },
  {
    type: 'ErrorCode',
    labelKey: 'publicAssetsTypeErrorCode',
    category: 'Definitions',
    categoryKey: 'assetsCategoryDefinitions',
    icon: Tag,
  },
  {
    type: 'Enum',
    labelKey: 'publicAssetsTypeEnum',
    category: 'Definitions',
    categoryKey: 'assetsCategoryDefinitions',
    icon: Database,
  },
  {
    type: 'JSON',
    labelKey: 'publicAssetsTypeJson',
    category: 'Shared Config',
    categoryKey: 'assetsCategorySharedConfig',
    icon: Braces,
  },
  {
    type: 'Text',
    labelKey: 'publicAssetsTypeText',
    category: 'Shared',
    categoryKey: 'assetsCategoryShared',
    icon: FileText,
  },
];

const emptyForm = (type: AssetType = 'URL', translate?: (key: string) => string): AssetForm => {
  const option = typeOptions.find((item) => item.type === type);
  return {
    name: '',
    type,
    category: translate && option ? translate(option.categoryKey) : option?.category || 'Shared',
    urlValue: '',
    errorItems: [{ code: '', message: '' }],
    enumItems: [''],
    jsonValue: '{\n  \n}',
    textValue: '',
  };
};

const parseErrorItems = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => ({
        code: String(item.code || ''),
        message: String(item.message || ''),
      }));
    }
  } catch {
    return value
      .split(',')
      .map((code) => ({ code: code.trim(), message: '' }))
      .filter((item) => item.code);
  }
  return [{ code: '', message: '' }];
};

const parseAssetForm = (asset: PublicAsset): AssetForm => {
  const type = normalizeType(asset.type);
  if (type === 'ErrorCode') {
    return {
      ...emptyForm(type),
      id: asset.id,
      name: asset.name,
      category: asset.category,
      errorItems: parseErrorItems(asset.value),
    };
  }
  if (type === 'Enum') {
    return {
      ...emptyForm(type),
      id: asset.id,
      name: asset.name,
      category: asset.category,
      enumItems: asset.value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };
  }
  if (type === 'JSON') {
    return {
      ...emptyForm(type),
      id: asset.id,
      name: asset.name,
      category: asset.category,
      jsonValue: formatJson(asset.value),
    };
  }
  if (type === 'Text') {
    return {
      ...emptyForm(type),
      id: asset.id,
      name: asset.name,
      category: asset.category,
      textValue: asset.value,
    };
  }
  return {
    ...emptyForm('URL'),
    id: asset.id,
    name: asset.name,
    category: asset.category,
    urlValue: asset.value,
  };
};

const normalizeType = (type: string): AssetType => {
  const lower = type.toLowerCase();
  if (lower === 'errorcode' || lower === 'error_code' || lower === 'error codes') return 'ErrorCode';
  if (lower === 'enum') return 'Enum';
  if (lower === 'json') return 'JSON';
  if (lower === 'text') return 'Text';
  return 'URL';
};

const formatJson = (value: string) => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const assetValueFromForm = (form: AssetForm) => {
  if (form.type === 'ErrorCode') {
    const items = form.errorItems
      .map((item) => ({ code: item.code.trim(), message: item.message.trim() }))
      .filter((item) => item.code);
    return JSON.stringify(items, null, 2);
  }
  if (form.type === 'Enum') {
    return form.enumItems.map((item) => item.trim()).filter(Boolean).join(', ');
  }
  if (form.type === 'JSON') {
    return formatJson(form.jsonValue);
  }
  if (form.type === 'Text') {
    return form.textValue.trim();
  }
  return form.urlValue.trim();
};

const assetIcon = (type: string) => {
  const normalized = normalizeType(type);
  return typeOptions.find((option) => option.type === normalized)?.icon || Database;
};

const assetTypeLabelKey = (type: string) => {
  const normalized = normalizeType(type);
  return typeOptions.find((option) => option.type === normalized)?.labelKey || 'publicAssetsTypeUrl';
};

const PublicAssets: React.FC = () => {
  const { t } = useLanguage();
  const projectId = window.localStorage.getItem('mockhub_project_id');
  const [assets, setAssets] = useState<PublicAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'assets' | 'suggestions'>('assets');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [acceptingSuggestionId, setAcceptingSuggestionId] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<AssetForm | null>(null);
  const [suggestions, setSuggestions] = useState<AssetSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AssetSuggestion | null>(null);
  const [ignoredSuggestionIds, setIgnoredSuggestionIds] = useState<string[]>([]);

  const loadAssets = async () => {
    if (!projectId) {
      setAssets([]);
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await request<PublicAsset[]>(`/api/projects/${projectId}/assets`);
      setAssets(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('publicAssetsUnavailable'));
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!projectId) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const data = await request<AssetSuggestion[]>(`/api/projects/${projectId}/assets/suggestions`);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      setIgnoredSuggestionIds([]);
      return;
    }
    const stored = window.localStorage.getItem(`mockhub_ignored_asset_suggestions_${projectId}`);
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      setIgnoredSuggestionIds(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      setIgnoredSuggestionIds([]);
    }
  }, [projectId]);

  const filteredAssets = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return assets;
    return assets.filter((asset) =>
      [asset.name, asset.value, asset.type, asset.category]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [assets, query]);

  const visibleSuggestions = useMemo(
    () => suggestions.filter((suggestion) => !ignoredSuggestionIds.includes(suggestion.id)),
    [ignoredSuggestionIds, suggestions],
  );

  const openCreate = () => setForm(emptyForm('URL', t));
  const openEdit = (asset: PublicAsset) => setForm(parseAssetForm(asset));

  const updateType = (type: AssetType) => {
    if (!form) return;
    setForm({
      ...emptyForm(type, t),
      id: form.id,
      name: form.name,
    });
  };

  const formatJsonValue = () => {
    if (!form || form.type !== 'JSON') return;
    setForm({ ...form, jsonValue: formatJson(form.jsonValue) });
  };

  const saveAsset = async () => {
    if (!projectId || !form || saving) return;
    const value = assetValueFromForm(form);
    if (!form.name.trim() || !value) {
      setError(t('publicAssetsValueRequired'));
      return;
    }
    if (form.type === 'JSON') {
      try {
        JSON.parse(form.jsonValue);
      } catch {
        setError(t('publicAssetsJsonInvalid'));
        return;
      }
    }
    if (form.type === 'ErrorCode') {
      const hasCode = form.errorItems.some((item) => item.code.trim());
      if (!hasCode) {
        setError(t('publicAssetsErrorCodeRequired'));
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        value,
        type: form.type,
        category: form.category.trim(),
      };
      if (form.id) {
        await request(`/api/projects/${projectId}/assets/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await request(`/api/projects/${projectId}/assets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setForm(null);
      await loadAssets();
      await loadSuggestions();
      setActiveTab('assets');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('publicAssetsSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const deleteAsset = async (asset: PublicAsset) => {
    if (!projectId) return;
    if (!window.confirm(`${t('publicAssetsDeleteConfirm')} ${asset.name}`)) return;
    try {
      await request(`/api/projects/${projectId}/assets/${asset.id}`, {
        method: 'DELETE',
      });
      await loadAssets();
      await loadSuggestions();
      setActiveTab('assets');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('publicAssetsDeleteFailed'));
    }
  };

  const acceptSuggestion = async (suggestion: AssetSuggestion) => {
    if (!projectId || acceptingSuggestionId) return;
    setAcceptingSuggestionId(suggestion.id);
    try {
      await request(`/api/projects/${projectId}/assets/suggestions/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suggestion.name,
          value: suggestion.value,
          type: suggestion.type,
          category: suggestion.category,
        }),
      });
      await loadAssets();
      await loadSuggestions();
      setSelectedSuggestion(null);
      ignoreSuggestion(suggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('publicAssetsSuggestionAcceptFailed'));
    } finally {
      setAcceptingSuggestionId('');
    }
  };

  const copyAsset = async (value: string) => {
    await navigator.clipboard.writeText(value).catch(() => {});
  };

  const ignoreSuggestion = (suggestion: AssetSuggestion) => {
    if (!projectId) return;
    const next = Array.from(new Set([...ignoredSuggestionIds, suggestion.id]));
    setIgnoredSuggestionIds(next);
    window.localStorage.setItem(`mockhub_ignored_asset_suggestions_${projectId}`, JSON.stringify(next));
    if (selectedSuggestion?.id === suggestion.id) {
      setSelectedSuggestion(null);
    }
  };

  const renderTypeFields = () => {
    if (!form) return null;
    if (form.type === 'ErrorCode') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('publicAssetsErrorCodeItems')}</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, errorItems: [...form.errorItems, { code: '', message: '' }] })}
              className="text-[11px] font-bold text-blue-600 cursor-pointer"
            >
              {t('publicAssetsAddCode')}
            </button>
          </div>
          <div className="space-y-2">
            {form.errorItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2">
                <input
                  value={item.code}
                  onChange={(event) => {
                    const next = [...form.errorItems];
                    next[index] = { ...next[index], code: event.target.value };
                    setForm({ ...form, errorItems: next });
                  }}
                  className="col-span-4 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={t('publicAssetsErrorCodePlaceholder')}
                />
                <input
                  value={item.message}
                  onChange={(event) => {
                    const next = [...form.errorItems];
                    next[index] = { ...next[index], message: event.target.value };
                    setForm({ ...form, errorItems: next });
                  }}
                  className="col-span-7 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={t('publicAssetsErrorMessagePlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = form.errorItems.filter((_, itemIndex) => itemIndex !== index);
                    setForm({ ...form, errorItems: next.length ? next : [{ code: '', message: '' }] });
                  }}
                  className="col-span-1 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (form.type === 'Enum') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('publicAssetsEnumItems')}</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, enumItems: [...form.enumItems, ''] })}
              className="text-[11px] font-bold text-blue-600 cursor-pointer"
            >
              {t('publicAssetsAddItem')}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {form.enumItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={item}
                  onChange={(event) => {
                    const next = [...form.enumItems];
                    next[index] = event.target.value;
                    setForm({ ...form, enumItems: next });
                  }}
                  className="min-w-0 flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder={`${t('publicAssetsEnumItemPlaceholder')} ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = form.enumItems.filter((_, itemIndex) => itemIndex !== index);
                    setForm({ ...form, enumItems: next.length ? next : [''] });
                  }}
                  className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (form.type === 'JSON') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{t('publicAssetsJsonValue')}</span>
            <button
              type="button"
              onClick={formatJsonValue}
              className="text-[11px] font-bold text-blue-600 cursor-pointer"
            >
              {t('publicAssetsFormatJson')}
            </button>
          </div>
          <textarea
            value={form.jsonValue}
            onChange={(event) => setForm({ ...form, jsonValue: event.target.value })}
            className="w-full min-h-40 px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="{ }"
            spellCheck={false}
          />
        </div>
      );
    }
    if (form.type === 'Text') {
      return (
        <textarea
          value={form.textValue}
          onChange={(event) => setForm({ ...form, textValue: event.target.value })}
          className="w-full min-h-28 px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          placeholder={t('publicAssetsTextPlaceholder')}
        />
      );
    }
    return (
      <input
        value={form.urlValue}
        onChange={(event) => setForm({ ...form, urlValue: event.target.value })}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        placeholder={t('publicAssetsUrlPlaceholder')}
      />
    );
  };

  const renderSuggestions = () => (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('publicAssetsSuggestionsTitle')}</h3>
          <p className="text-xs text-slate-500">{t('publicAssetsSuggestionsDesc')}</p>
        </div>
        {suggestionsLoading ? (
          <span className="text-[10px] font-bold text-slate-400 uppercase">{t('publicAssetsLoading')}</span>
        ) : null}
      </div>

      {visibleSuggestions.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {visibleSuggestions.map((suggestion) => {
            const Icon = assetIcon(suggestion.type);
            const busy = acceptingSuggestionId === suggestion.id;
            return (
              <div key={suggestion.id} className="grid grid-cols-12 items-center gap-3 px-3 py-2 hover:bg-slate-50">
                <div className="col-span-12 min-w-0 md:col-span-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500">
                      <Icon size={12} />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-slate-900">{suggestion.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {suggestion.category} · {t(assetTypeLabelKey(suggestion.type))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 min-w-0 rounded border border-blue-100 bg-blue-50/40 px-2 py-1 font-mono text-[10px] text-blue-600 md:col-span-4">
                  <div className="truncate">
                    {normalizeType(suggestion.type) === 'JSON' || normalizeType(suggestion.type) === 'ErrorCode'
                      ? formatJson(suggestion.value).replace(/\s+/g, ' ')
                      : suggestion.value}
                  </div>
                </div>
                <div className="col-span-8 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 md:col-span-3">
                  <span>{t('publicAssetsSuggestionSource')}: {suggestion.source}</span>
                  <span>{t('publicAssetsSuggestionCount')}: {suggestion.count}</span>
                  <span>{t('publicAssetsSuggestionConfidence')}: {Math.round(suggestion.confidence * 100)}%</span>
                </div>
                <div className="col-span-4 flex justify-end gap-2 md:col-span-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSuggestion(suggestion)}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer"
                    title={t('publicAssetsSuggestionView')}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => ignoreSuggestion(suggestion)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    title={t('publicAssetsSuggestionIgnore')}
                  >
                    <X size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => acceptSuggestion(suggestion)}
                    disabled={Boolean(acceptingSuggestionId)}
                    className="rounded bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {busy ? t('publicAssetsSaving') : t('publicAssetsSuggestionAccept')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400">
          {t('publicAssetsSuggestionEmpty')}
        </div>
      )}
    </div>
  );

  const renderSuggestionDetails = () => {
    if (!selectedSuggestion) return null;
    const Icon = assetIcon(selectedSuggestion.type);
    const fullValue =
      normalizeType(selectedSuggestion.type) === 'JSON' || normalizeType(selectedSuggestion.type) === 'ErrorCode'
        ? formatJson(selectedSuggestion.value)
        : selectedSuggestion.value;
    return (
      <div className="fixed inset-y-0 right-0 z-30 w-full max-w-md border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500">
              <Icon size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('publicAssetsSuggestionDetails')}</h3>
              <p className="text-[11px] text-slate-500">{selectedSuggestion.name}</p>
            </div>
          </div>
          <button type="button" onClick={() => setSelectedSuggestion(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('publicAssetsColumnType')}</div>
              <div className="mt-1 font-semibold text-slate-800">{t(assetTypeLabelKey(selectedSuggestion.type))}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('publicAssetsCategoryPlaceholder')}</div>
              <div className="mt-1 font-semibold text-slate-800">{selectedSuggestion.category}</div>
            </div>
          </div>

          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('publicAssetsSuggestionFullValue')}
            </div>
            <pre className="max-h-72 overflow-auto rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-xs text-blue-700 whitespace-pre-wrap">
              {fullValue}
            </pre>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('publicAssetsSuggestionMeta')}
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div>{t('publicAssetsSuggestionSource')}: {selectedSuggestion.source}</div>
              <div>{t('publicAssetsSuggestionCount')}: {selectedSuggestion.count}</div>
              <div>{t('publicAssetsSuggestionConfidence')}: {Math.round(selectedSuggestion.confidence * 100)}%</div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => copyAsset(selectedSuggestion.value)}
              className="rounded border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              {t('publicAssetsSuggestionCopy')}
            </button>
            <button
              type="button"
              onClick={() => ignoreSuggestion(selectedSuggestion)}
              className="rounded border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
            >
              {t('publicAssetsSuggestionIgnore')}
            </button>
            <button
              type="button"
              onClick={() => acceptSuggestion(selectedSuggestion)}
              disabled={Boolean(acceptingSuggestionId)}
              className="rounded bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {acceptingSuggestionId === selectedSuggestion.id
                ? t('publicAssetsSaving')
                : t('publicAssetsSuggestionAccept')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTabs = () => (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setActiveTab('assets')}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
          activeTab === 'assets'
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {t('publicAssetsOfficialTab')}
        <span className="ml-1 text-[10px] text-slate-400">{assets.length}</span>
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('suggestions')}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
          activeTab === 'suggestions'
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        {t('publicAssetsSuggestionsTab')}
        <span className="ml-1 text-[10px] text-slate-400">{visibleSuggestions.length}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('publicAssetsTitle')}</h2>
          <p className="text-sm text-slate-500">{t('publicAssetsDesc')}</p>
        </div>
        {activeTab === 'assets' ? (
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder={t('publicAssetsSearchPlaceholder')}
              />
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              {t('publicAssetsAdd')}
            </button>
          </div>
        ) : null}
      </div>

      {renderTabs()}

      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      ) : null}

      {activeTab === 'assets' && form ? (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              {form.id ? t('publicAssetsEdit') : t('publicAssetsAdd')}
            </h3>
            <button type="button" onClick={() => setForm(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {typeOptions.map((option) => {
              const Icon = option.icon;
              const active = form.type === option.type;
              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => updateType(option.type)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-bold cursor-pointer ${
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Icon size={14} />
                  {t(option.labelKey)}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder={t('publicAssetsAssetNamePlaceholder')}
            />
            <input
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder={t('publicAssetsCategoryPlaceholder')}
            />
            <button
              type="button"
              onClick={saveAsset}
              disabled={saving}
              className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {saving ? t('publicAssetsSaving') : t('publicAssetsSave')}
            </button>
          </div>

          {renderTypeFields()}
        </div>
      ) : null}

      {activeTab === 'suggestions' ? renderSuggestions() : null}

      {activeTab === 'assets' ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:grid">
            <div className="col-span-4">{t('publicAssetsColumnName')}</div>
            <div className="col-span-2">{t('publicAssetsColumnType')}</div>
            <div className="col-span-5">{t('publicAssetsColumnValue')}</div>
            <div className="col-span-1 text-right">{t('publicAssetsColumnActions')}</div>
          </div>
          <div className="divide-y divide-slate-100">
          {filteredAssets.map((asset) => {
            const Icon = assetIcon(asset.type);
            const normalizedType = normalizeType(asset.type);
            return (
              <div key={asset.id} className="grid grid-cols-12 items-center gap-3 px-3 py-2 hover:bg-slate-50">
                <div className="col-span-12 min-w-0 md:col-span-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-500">
                      {normalizedType === 'URL' ? <ExternalLink size={14} /> : <Icon size={14} />}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">{asset.name}</div>
                      <div className="truncate text-[10px] text-slate-400">{asset.category}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-4 text-xs font-bold text-slate-500 md:col-span-2">
                  {t(assetTypeLabelKey(asset.type))}
                </div>
                <div className="col-span-8 min-w-0 rounded border border-blue-100 bg-blue-50/40 px-2 py-1 font-mono text-[11px] text-blue-600 md:col-span-5">
                  <div className="truncate">
                    {normalizedType === 'JSON' || normalizedType === 'ErrorCode'
                      ? formatJson(asset.value).replace(/\s+/g, ' ')
                      : asset.value}
                  </div>
                </div>
                <div className="col-span-12 flex items-center justify-end gap-2 md:col-span-1">
                  <button
                    type="button"
                    onClick={() => copyAsset(asset.value)}
                    className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(asset)}
                    className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteAsset(asset)}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          {t('publicAssetsLoading')}
        </div>
      ) : null}

      {activeTab === 'assets' && !loading && filteredAssets.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-slate-400">
            <Database size={24} />
          </div>
          <h4 className="font-semibold text-slate-900">{t('publicAssetsEmptyTitle')}</h4>
          <p className="text-sm text-slate-500 max-w-sm mt-1">{t('publicAssetsEmptyDesc')}</p>
        </div>
      ) : null}

      {renderSuggestionDetails()}
    </div>
  );
};

export default PublicAssets;
