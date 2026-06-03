import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Braces,
  CheckCircle2,
  Copy,
  Database,
  FileJson,
  LoaderCircle,
  Plus,
  Save,
  Terminal,
  Zap,
} from 'lucide-react';
import type { ApiHeaderRow, ApiMockMode, ApiSchemaRow, PublicAsset } from '../../types';
import JsonCodeEditor from './JsonCodeEditor';
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
  mockStaticBody: string;
  setMockStaticBody: (value: string) => void;
  mockScript: string;
  setMockScript: (value: string) => void;
  addRequestHeader: () => void;
  addResponseHeader: () => void;
  addQueryParamField: () => void;
  addBodyField: () => void;
  addResponseField: () => void;
  onPersistStaticMockFromProxy: (payload: {
    mockStaticBody: string;
    responseHeaders: ApiHeaderRow[];
    responseSchema: ApiSchemaRow[];
    responseMode: 'static';
  }) => Promise<void> | void;
  proxyResponseStatus: number | null;
  proxyResponseStatusText: string;
  proxyResponseBody: string;
  proxyResponseFeedback: {
    type: 'info' | 'success' | 'error';
    message: string;
  } | null;
  proxyStaticSaving: boolean;
  publicAssets: PublicAsset[];
}

interface NestedSchemaNode {
  type: ApiSchemaRow['type'];
  description?: string;
  required?: boolean;
  properties?: Record<string, NestedSchemaNode>;
  items?: NestedSchemaNode;
}

interface NamedNestedSchemaNode {
  name: string;
  node: NestedSchemaNode;
}

type JsonStatusType = 'info' | 'success' | 'error';

interface JsonStatusState {
  type: JsonStatusType;
  message: string;
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
  mockStaticBody,
  setMockStaticBody,
  mockScript,
  setMockScript,
  addRequestHeader,
  addResponseHeader,
  addQueryParamField,
  addBodyField,
  addResponseField,
  onPersistStaticMockFromProxy,
  proxyResponseStatus,
  proxyResponseStatusText,
  proxyResponseBody,
  proxyResponseFeedback,
  proxyStaticSaving,
  publicAssets,
}) => {
  const matchesSection = (
    row: ApiSchemaRow,
    section: NonNullable<ApiSchemaRow['section']>,
  ) => {
    if (section === 'response') {
      return row.section === 'response' || row.section === undefined;
    }
    return row.section === section;
  };

  const cascadeDelete = (
    list: ApiSchemaRow[],
    index: number,
    section?: ApiSchemaRow['section'],
  ) => {
    const parent = list[index];
    const parentDepth = parent?.depth ?? 0;
    let end = index + 1;
    while (end < list.length) {
      const item = list[end];
      if (
        (section && !matchesSection(item, section)) ||
        (item.depth ?? 0) <= parentDepth
      ) {
        break;
      }
      end += 1;
    }
    return [...list.slice(0, index), ...list.slice(end)];
  };

  const [queryViewMode, setQueryViewMode] = useState<'table' | 'json'>('table');
  const [bodyViewMode, setBodyViewMode] = useState<'table' | 'json'>('table');
  const [responseViewMode, setResponseViewMode] = useState<'table' | 'json'>('table');
  const [queryJsonText, setQueryJsonText] = useState('');
  const [bodyJsonText, setBodyJsonText] = useState('');
  const [responseJsonText, setResponseJsonText] = useState('');
  const [queryJsonDirty, setQueryJsonDirty] = useState(false);
  const [bodyJsonDirty, setBodyJsonDirty] = useState(false);
  const [responseJsonDirty, setResponseJsonDirty] = useState(false);
  const [queryJsonStatus, setQueryJsonStatus] = useState<JsonStatusState | null>(
    null,
  );
  const [bodyJsonStatus, setBodyJsonStatus] = useState<JsonStatusState | null>(
    null,
  );
  const [responseJsonStatus, setResponseJsonStatus] =
    useState<JsonStatusState | null>(null);

  const mergeSectionRows = (
    source: ApiSchemaRow[],
    rows: ApiSchemaRow[],
    section: NonNullable<ApiSchemaRow['section']>,
  ) => {
    if (section === 'query') {
      return [...rows, ...source.filter((row) => !matchesSection(row, 'query'))];
    }

    if (section === 'body') {
      const queryRows = source.filter((row) => matchesSection(row, 'query'));
      const otherRows = source.filter(
        (row) => !matchesSection(row, 'query') && !matchesSection(row, 'body'),
      );
      return [...queryRows, ...rows, ...otherRows];
    }

    return rows;
  };

  const normalizeSchemaType = (value: unknown): ApiSchemaRow['type'] => {
    if (
      value === 'string' ||
      value === 'number' ||
      value === 'boolean' ||
      value === 'object' ||
      value === 'array' ||
      value === 'integer'
    ) {
      return value;
    }
    return 'string';
  };

  const normalizeNestedSchemaNode = (value: unknown): NestedSchemaNode => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return { type: 'string' };
    }
    const record = value as Record<string, unknown>;
    return {
      type: normalizeSchemaType(record.type),
      description:
        typeof record.description === 'string'
          ? record.description
          : typeof record.desc === 'string'
            ? record.desc
            : undefined,
      required: Boolean(record.required),
      properties:
        record.properties &&
        typeof record.properties === 'object' &&
        !Array.isArray(record.properties)
          ? (record.properties as Record<string, NestedSchemaNode>)
          : undefined,
      items:
        record.items &&
        typeof record.items === 'object' &&
        !Array.isArray(record.items)
          ? normalizeNestedSchemaNode(record.items)
          : undefined,
    };
  };

  const entriesToProperties = (entries: NamedNestedSchemaNode[]) =>
    Object.fromEntries(entries.map((entry) => [entry.name, entry.node]));

  const collectNestedEntries = (
    rows: ApiSchemaRow[],
    startIndex: number,
    parentDepth: number,
  ): { entries: NamedNestedSchemaNode[]; nextIndex: number } => {
    const entries: NamedNestedSchemaNode[] = [];
    let currentIndex = startIndex;

    while (currentIndex < rows.length) {
      const currentRow = rows[currentIndex];
      const currentDepth = currentRow.depth ?? 0;

      if (currentDepth <= parentDepth) {
        break;
      }

      if (currentDepth !== parentDepth + 1) {
        currentIndex += 1;
        continue;
      }

      const result = buildNestedEntry(rows, currentIndex);
      entries.push(result.entry);
      currentIndex = result.nextIndex;
    }

    return {
      entries,
      nextIndex: currentIndex,
    };
  };

  const buildNestedEntry = (
    rows: ApiSchemaRow[],
    index: number,
  ): { entry: NamedNestedSchemaNode; nextIndex: number } => {
    const row = rows[index];
    const depth = row.depth ?? 0;
    const baseNode: NestedSchemaNode = {
      type: normalizeSchemaType(row.type),
      description: row.desc || undefined,
      required: row.required,
    };

    if (row.type === 'object') {
      const { entries, nextIndex } = collectNestedEntries(rows, index + 1, depth);
      return {
        entry: {
          name: row.name,
          node: {
            ...baseNode,
            properties: entriesToProperties(entries),
          },
        },
        nextIndex,
      };
    }

    if (row.type === 'array') {
      const { entries, nextIndex } = collectNestedEntries(rows, index + 1, depth);
      let items: NestedSchemaNode | undefined;

      if (entries.length === 1 && entries[0].name === 'item') {
        items = entries[0].node;
      } else if (entries.length > 0) {
        items = {
          type: 'object',
          properties: entriesToProperties(entries),
        };
      }

      return {
        entry: {
          name: row.name,
          node: {
            ...baseNode,
            ...(items ? { items } : {}),
          },
        },
        nextIndex,
      };
    }

    return {
      entry: {
        name: row.name,
        node: baseNode,
      },
      nextIndex: index + 1,
    };
  };

  const buildSectionSchema = (
    rows: ApiSchemaRow[],
    section: NonNullable<ApiSchemaRow['section']>,
  ): NestedSchemaNode => {
    const sectionRows = rows.filter((row) => matchesSection(row, section));
    const { entries } = collectNestedEntries(sectionRows, 0, -1);
    return {
      type: 'object',
      properties: entriesToProperties(entries),
    };
  };

  const flattenNestedNode = (
    name: string,
    node: NestedSchemaNode,
    depth: number,
    section: NonNullable<ApiSchemaRow['section']>,
  ): ApiSchemaRow[] => {
    const rows: ApiSchemaRow[] = [
      {
        name,
        type: normalizeSchemaType(node.type),
        required: Boolean(node.required),
        desc: node.description || '',
        depth,
        section,
      },
    ];

    if (node.type === 'object' && node.properties) {
      Object.entries(node.properties).forEach(([childName, childNode]) => {
        rows.push(
          ...flattenNestedNode(
            childName,
            normalizeNestedSchemaNode(childNode),
            depth + 1,
            section,
          ),
        );
      });
    }

    if (node.type === 'array' && node.items) {
      const itemsNode = normalizeNestedSchemaNode(node.items);
      if (itemsNode.type === 'object' && itemsNode.properties) {
        Object.entries(itemsNode.properties).forEach(([childName, childNode]) => {
          rows.push(
            ...flattenNestedNode(
              childName,
              normalizeNestedSchemaNode(childNode),
              depth + 1,
              section,
            ),
          );
        });
      } else {
        rows.push(
          ...flattenNestedNode('item', itemsNode, depth + 1, section),
        );
      }
    }

    return rows;
  };

  const parseNestedSchemaJson = (
    text: string,
    section: NonNullable<ApiSchemaRow['section']>,
  ): ApiSchemaRow[] | null => {
    try {
      const parsed = JSON.parse(text) as unknown;
      let rootNode: NestedSchemaNode;

      if (
        parsed &&
        typeof parsed === 'object' &&
        !Array.isArray(parsed) &&
        !('type' in (parsed as Record<string, unknown>))
      ) {
        rootNode = {
          type: 'object',
          properties: parsed as Record<string, NestedSchemaNode>,
        };
      } else {
        rootNode = normalizeNestedSchemaNode(parsed);
      }

      if (rootNode.type !== 'object') {
        return null;
      }

      const rows: ApiSchemaRow[] = [];
      Object.entries(rootNode.properties || {}).forEach(([name, node]) => {
        rows.push(
          ...flattenNestedNode(
            name,
            normalizeNestedSchemaNode(node),
            0,
            section,
          ),
        );
      });

      return rows;
    } catch {
      return null;
    }
  };

  const getJsonStatusClasses = (type: JsonStatusType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'error':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-700';
    }
  };

  const copyAssetValue = (value: string) => {
    void navigator.clipboard.writeText(value).catch(() => {});
  };

  const insertAssetValue = (asset: PublicAsset) => {
    if (responseMode === 'script') {
      const key = asset.name.replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => String(char).toUpperCase()).replace(/^[^a-zA-Z]+/, '');
      const variableName = key ? key.charAt(0).toLowerCase() + key.slice(1) : 'publicAsset';
      setMockScript(`${mockScript}\n\nconst ${variableName} = ${JSON.stringify(asset.value)};`);
      return;
    }
    if (asset.type.toLowerCase() === 'json' || asset.type.toLowerCase() === 'errorcode') {
      setMockStaticBody(asset.value);
      return;
    }
    setMockStaticBody(JSON.stringify({ value: asset.value }, null, 2));
  };

  const renderAssetReference = () => {
    if (publicAssets.length === 0 || responseMode === 'proxy') return null;
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <Database size={12} />
          {t('mockAssetReferenceTitle')}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {publicAssets.slice(0, 6).map((asset) => (
            <div key={asset.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-800">{asset.name}</div>
                <div className="truncate font-mono text-[10px] text-slate-400">{asset.type} · {asset.value}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => copyAssetValue(asset.value)}
                  className="rounded border border-slate-200 p-1 text-slate-400 hover:text-blue-600"
                  title={t('mockAssetCopy')}
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => insertAssetValue(asset)}
                  className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-100"
                >
                  {t('mockAssetInsert')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderJsonEditor = (
    text: string,
    setText: (value: string) => void,
    setDirty: (value: boolean) => void,
    status: JsonStatusState | null,
    setStatus: (value: JsonStatusState | null) => void,
    onApply: () => void,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {t('schemaViewJson')}
        </div>
        <button
          type="button"
          onClick={() => {
            try {
              const formatted = JSON.stringify(JSON.parse(text), null, 2);
              setText(formatted);
              setDirty(true);
              setStatus({
                type: 'info',
                message: t('schemaJsonDirty'),
              });
            } catch {
              setStatus({
                type: 'error',
                message: t('schemaJsonInvalid'),
              });
            }
          }}
          className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
        >
          {t('schemaJsonFormat')}
        </button>
      </div>
      <JsonCodeEditor
        value={text}
        onChange={(value) => {
          setText(value);
          setDirty(true);
          setStatus({
            type: 'info',
            message: t('schemaJsonDirty'),
          });
        }}
        onBlur={onApply}
      />
      {status && (
        <div
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] ${getJsonStatusClasses(
            status.type,
          )}`}
        >
          {status.type === 'error' ? (
            <AlertCircle size={12} />
          ) : (
            <CheckCircle2 size={12} />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );

  useEffect(() => {
    if (queryViewMode === 'json' && !queryJsonDirty) {
      setQueryJsonText(
        JSON.stringify(buildSectionSchema(requestParams, 'query'), null, 2),
      );
      setQueryJsonStatus({
        type: 'info',
        message: t('schemaJsonSynced'),
      });
    }
  }, [queryViewMode, queryJsonDirty, requestParams, t]);

  useEffect(() => {
    if (bodyViewMode === 'json' && !bodyJsonDirty) {
      setBodyJsonText(
        JSON.stringify(buildSectionSchema(requestParams, 'body'), null, 2),
      );
      setBodyJsonStatus({
        type: 'info',
        message: t('schemaJsonSynced'),
      });
    }
  }, [bodyViewMode, bodyJsonDirty, requestParams, t]);

  useEffect(() => {
    if (responseViewMode === 'json' && !responseJsonDirty) {
      setResponseJsonText(
        JSON.stringify(buildSectionSchema(responseSchema, 'response'), null, 2),
      );
      setResponseJsonStatus({
        type: 'info',
        message: t('schemaJsonSynced'),
      });
    }
  }, [responseViewMode, responseJsonDirty, responseSchema, t]);

  switch (activeTab) {
    case 'params':
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('schemaQueryTitle')}
              </h5>
              <div className="flex items-center gap-2">
                <div className="flex rounded-full bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setQueryViewMode('table')}
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      queryViewMode === 'table'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {t('schemaViewTable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQueryJsonDirty(false);
                      setQueryJsonStatus({
                        type: 'info',
                        message: t('schemaJsonSynced'),
                      });
                      setQueryJsonText(
                        JSON.stringify(buildSectionSchema(requestParams, 'query'), null, 2),
                      );
                      setQueryViewMode('json');
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      queryViewMode === 'json'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {t('schemaViewJson')}
                  </button>
                </div>
                {queryViewMode === 'table' && (
                  <button
                    type="button"
                    onClick={addQueryParamField}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Plus size={12} /> {t('schemaAddField')}
                  </button>
                )}
              </div>
            </div>
            {queryViewMode === 'table' ? (
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
                      {responseMode === 'proxy' && (
                        <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-40">
                          {t('headersValue')}
                        </th>
                      )}
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
                            setRequestParams(cascadeDelete(requestParams, index, 'query'));
                          }}
                          onAddChild={() => {
                            const parentDepth = row.depth ?? 0;
                            const list = [...requestParams];
                            list.splice(index + 1, 0, {
                              name: 'childField',
                              type: 'string',
                              required: false,
                              desc: '',
                              value: '',
                              depth: parentDepth + 1,
                              section: 'query',
                            });
                            setRequestParams(list);
                          }}
                          descriptionPlaceholder={t('schemaDescription')}
                          showValueInput={responseMode === 'proxy'}
                          valuePlaceholder={t('headersValue')}
                        />
                      ) : null,
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              renderJsonEditor(
                queryJsonText,
                setQueryJsonText,
                setQueryJsonDirty,
                queryJsonStatus,
                setQueryJsonStatus,
                () => {
                  const parsed = parseNestedSchemaJson(queryJsonText, 'query');
                  if (!parsed) {
                    setQueryJsonStatus({
                      type: 'error',
                      message: t('schemaJsonInvalid'),
                    });
                    return;
                  }
                  setRequestParams(mergeSectionRows(requestParams, parsed, 'query'));
                  setQueryJsonText(
                    JSON.stringify(buildSectionSchema(mergeSectionRows(requestParams, parsed, 'query'), 'query'), null, 2),
                  );
                  setQueryJsonDirty(false);
                  setQueryJsonStatus({
                    type: 'success',
                    message: t('schemaJsonApplied'),
                  });
                },
              )
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('schemaBodyTitle')}
              </h5>
              <div className="flex items-center gap-2">
                <div className="flex rounded-full bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setBodyViewMode('table')}
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      bodyViewMode === 'table'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {t('schemaViewTable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBodyJsonDirty(false);
                      setBodyJsonStatus({
                        type: 'info',
                        message: t('schemaJsonSynced'),
                      });
                      setBodyJsonText(
                        JSON.stringify(buildSectionSchema(requestParams, 'body'), null, 2),
                      );
                      setBodyViewMode('json');
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      bodyViewMode === 'json'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {t('schemaViewJson')}
                  </button>
                </div>
                {bodyViewMode === 'table' && (
                  <button
                    type="button"
                    onClick={addBodyField}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    <Plus size={12} /> {t('schemaAddField')}
                  </button>
                )}
              </div>
            </div>
            {bodyViewMode === 'table' ? (
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
                      {responseMode === 'proxy' && (
                        <th className="px-3 py-1.5 text-left font-bold text-slate-500 w-40">
                          {t('headersValue')}
                        </th>
                      )}
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
                            setRequestParams(cascadeDelete(requestParams, index, 'body'));
                          }}
                          onAddChild={() => {
                            const parentDepth = row.depth ?? 0;
                            const list = [...requestParams];
                            list.splice(index + 1, 0, {
                              name: 'childField',
                              type: 'string',
                              required: false,
                              desc: '',
                              value: '',
                              depth: parentDepth + 1,
                              section: 'body',
                            });
                            setRequestParams(list);
                          }}
                          descriptionPlaceholder={t('schemaDescription')}
                          showValueInput={responseMode === 'proxy'}
                          valuePlaceholder={t('headersValue')}
                        />
                      ) : null,
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              renderJsonEditor(
                bodyJsonText,
                setBodyJsonText,
                setBodyJsonDirty,
                bodyJsonStatus,
                setBodyJsonStatus,
                () => {
                  const parsed = parseNestedSchemaJson(bodyJsonText, 'body');
                  if (!parsed) {
                    setBodyJsonStatus({
                      type: 'error',
                      message: t('schemaJsonInvalid'),
                    });
                    return;
                  }
                  setRequestParams(mergeSectionRows(requestParams, parsed, 'body'));
                  setBodyJsonText(
                    JSON.stringify(buildSectionSchema(mergeSectionRows(requestParams, parsed, 'body'), 'body'), null, 2),
                  );
                  setBodyJsonDirty(false);
                  setBodyJsonStatus({
                    type: 'success',
                    message: t('schemaJsonApplied'),
                  });
                },
              )
            )}
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
              <div className="flex items-center gap-2">
                <div className="flex rounded-full bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setResponseViewMode('table')}
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      responseViewMode === 'table'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {t('schemaViewTable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResponseJsonDirty(false);
                      setResponseJsonStatus({
                        type: 'info',
                        message: t('schemaJsonSynced'),
                      });
                      setResponseJsonText(
                        JSON.stringify(buildSectionSchema(responseSchema, 'response'), null, 2),
                      );
                      setResponseViewMode('json');
                    }}
                    className={`px-2 py-0.5 text-[10px] rounded-full ${
                      responseViewMode === 'json'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-400'
                    }`}
                  >
                    {t('schemaViewJson')}
                  </button>
                </div>
                {responseViewMode === 'table' && (
                  <button
                    type="button"
                    onClick={addResponseField}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} /> {t('schemaAddField')}
                  </button>
                )}
              </div>
            </div>
            {responseViewMode === 'table' ? (
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
                          setResponseSchema(cascadeDelete(responseSchema, index, 'response'));
                        }}
                        onAddChild={() => {
                          const parentDepth = row.depth ?? 0;
                          const list = [...responseSchema];
                          list.splice(index + 1, 0, {
                            name: 'childField',
                            type: 'string',
                            required: false,
                            desc: '',
                            depth: parentDepth + 1,
                            section: 'response',
                          });
                          setResponseSchema(list);
                        }}
                        descriptionPlaceholder={t('schemaDescription')}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              renderJsonEditor(
                responseJsonText,
                setResponseJsonText,
                setResponseJsonDirty,
                responseJsonStatus,
                setResponseJsonStatus,
                () => {
                  const parsed = parseNestedSchemaJson(responseJsonText, 'response');
                  if (!parsed) {
                    setResponseJsonStatus({
                      type: 'error',
                      message: t('schemaJsonInvalid'),
                    });
                    return;
                  }
                  setResponseSchema(parsed);
                  setResponseJsonText(
                    JSON.stringify(buildSectionSchema(parsed, 'response'), null, 2),
                  );
                  setResponseJsonDirty(false);
                  setResponseJsonStatus({
                    type: 'success',
                    message: t('schemaJsonApplied'),
                  });
                },
              )
            )}
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
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-[10px] text-amber-700">
                {t('mockProxyUseTabsHint')}
              </div>

              {proxyResponseFeedback && (
                <div
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] ${getJsonStatusClasses(
                    proxyResponseFeedback.type,
                  )}`}
                >
                  {proxyResponseFeedback.type === 'error' ? (
                    <AlertCircle size={12} />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}
                  <span>{proxyResponseFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {t('mockProxyResponseStatus')}
                </div>
                <div className="font-mono text-xs text-slate-700">
                  {proxyResponseStatus !== null
                    ? `${proxyResponseStatus} ${proxyResponseStatusText}`.trim()
                    : '--'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('mockProxyResponseData')}
                  </h5>
                  <button
                    type="button"
                    disabled={!proxyResponseBody || proxyStaticSaving}
                    onClick={() =>
                      void onPersistStaticMockFromProxy({
                        mockStaticBody: proxyResponseBody,
                        responseHeaders,
                        responseSchema,
                        responseMode: 'static',
                      })
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {proxyStaticSaving && <LoaderCircle size={12} className="animate-spin" />}
                      {t('mockProxySaveStatic')}
                    </span>
                  </button>
                </div>
                {proxyResponseBody ? (
                  <JsonCodeEditor
                    value={proxyResponseBody}
                    onChange={() => {}}
                    minHeightClassName="min-h-[320px]"
                    readOnly
                  />
                ) : (
                  <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400">
                    {t('mockProxyNoResponse')}
                  </div>
                )}
              </div>
            </div>
          ) : responseMode === 'static' ? (
            <div className="space-y-3">
              {renderAssetReference()}
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('mockStaticPreviewTitle')}
                </h5>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                    <Copy size={12} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                    <Braces size={12} />
                  </button>
                </div>
              </div>
              <JsonCodeEditor
                value={mockStaticBody}
                onChange={setMockStaticBody}
                minHeightClassName="min-h-[320px]"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {renderAssetReference()}
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
                  <button className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg cursor-pointer">
                    <Copy size={12} />
                  </button>
                  <button className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-lg cursor-pointer">
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
