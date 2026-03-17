import React, { useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Copy, Link as LinkIcon, Key } from 'lucide-react';
import CodeBlock from './CodeBlock';

const IntegrationGuidePage: React.FC = () => {
  const { t } = useLanguage();
  const projectId =
    window.localStorage.getItem('mockhub_project_id') || 'your-project-id';
  const projectName =
    window.localStorage.getItem('mockhub_project_name') || 'Demo Project';
  const storedMockKey =
    window.localStorage.getItem('mockhub_project_mockKey') || '';
  const mockKey =
    storedMockKey || (projectId && projectId !== 'your-project-id'
      ? `mk_${projectId.slice(0, 8)}`
      : 'mk_your_mock_key');
  const baseOrigin =
    typeof window !== 'undefined'
      ? window.location.origin.replace(/\/$/, '')
      : 'https://mock.example.com';
  const mockGatewayUrl = `${baseOrigin}/gateway/${mockKey}`;
  const [activeTab, setActiveTab] = useState<'axios' | 'fetch' | 'vite' | 'next'>('axios');

  const axiosSnippet = useMemo(
    () =>
      `import axios from 'axios';

const api = axios.create({
  baseURL: '${mockGatewayUrl}',
  headers: {
    'x-mock-key': '${mockKey}',
  },
});

// Example usage
export async function fetchUserProfile() {
  const res = await api.get('/api/v1/user/profile');
  return res.data;
}`,
    [mockGatewayUrl, mockKey],
  );

  const fetchSnippet = useMemo(
    () =>
      `const MOCK_GATEWAY = '${mockGatewayUrl}';
const MOCK_KEY = '${mockKey}';

export async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
    'x-mock-key': MOCK_KEY,
  };

  const res = await fetch(\`\${MOCK_GATEWAY}\${path}\`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(\`Request failed: \${res.status}\`);
  }

  return res.json();
}

// Example usage
request('/api/v1/login', { method: 'POST', body: JSON.stringify({ username, password }) });`,
    [mockGatewayUrl, mockKey],
  );

  const viteSnippet = useMemo(
    () =>
      `// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const MOCK_GATEWAY = '${baseOrigin}';
const MOCK_KEY = '${mockKey}';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: MOCK_GATEWAY,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('x-mock-key', MOCK_KEY);
          });
        },
      },
    },
  },
});`,
    [baseOrigin, mockKey],
  );

  const nextSnippet = useMemo(
    () =>
      `// middleware.ts (Next.js 13+)
import { NextRequest, NextResponse } from 'next/server';

const MOCK_GATEWAY = '${baseOrigin}';
const MOCK_KEY = '${mockKey}';

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const url = new URL(req.nextUrl.pathname, MOCK_GATEWAY);
  url.search = req.nextUrl.search;

  const res = await fetch(url.toString(), {
    method: req.method,
    headers: {
      ...Object.fromEntries(req.headers),
      'x-mock-key': MOCK_KEY,
    },
    body: req.body,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: res.headers,
  });
}

export const config = {
  matcher: ['/api/:path*'],
};`,
    [baseOrigin, mockKey],
  );

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('integrationGuideTitle')}
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl">
            {t('integrationGuideDesc')}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Key size={14} className="text-blue-600" />
            <span>{t('integrationCurrentProject')}</span>
          </div>
          <div className="text-xs text-slate-500">
            <div className="font-semibold text-slate-900 mb-1">{projectName}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">
                mockKey
              </span>
              <code className="text-[10px] font-mono text-slate-700 truncate">
                {mockKey}
              </code>
              <button
                type="button"
                onClick={() => copy(mockKey)}
                className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <LinkIcon size={12} className="text-slate-400" />
              <span className="font-semibold text-slate-700">
                {t('integrationMockBaseUrl')}
              </span>
            </div>
            <code className="block text-[10px] font-mono text-slate-700 bg-slate-50 rounded px-2 py-1 break-all">
              {mockGatewayUrl}
            </code>
          </div>

          <p className="text-[11px] text-slate-500">
            {t('integrationMockKeyHeader')}
          </p>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">
            {t('integrationHowItWorksTitle')}
          </h3>
          <ol className="space-y-1.5 text-[11px] text-slate-600 list-decimal list-inside">
            <li>{t('integrationHowItWorksStep1')}</li>
            <li>{t('integrationHowItWorksStep2')}</li>
            <li>{t('integrationHowItWorksStep3')}</li>
          </ol>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">
            {t('integrationCodeExamplesTitle')}
          </h3>
          <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab('axios')}
              className={`px-2 py-0.5 text-[10px] rounded-full ${
                activeTab === 'axios'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Axios
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fetch')}
              className={`px-2 py-0.5 text-[10px] rounded-full ${
                activeTab === 'fetch'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Fetch
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('vite')}
              className={`px-2 py-0.5 text-[10px] rounded-full ${
                activeTab === 'vite'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Vite
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('next')}
              className={`px-2 py-0.5 text-[10px] rounded-full ${
                activeTab === 'next'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Next.js
            </button>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
          <header className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/60">
            <span className="text-[11px] font-semibold text-slate-100">
              {activeTab === 'axios'
                ? t('integrationAxiosTitle')
                : activeTab === 'fetch'
                  ? t('integrationFetchTitle')
                  : activeTab === 'vite'
                    ? t('integrationViteTitle')
                    : t('integrationNextTitle')}
            </span>
            <button
              type="button"
              onClick={() =>
                copy(
                  activeTab === 'axios'
                    ? axiosSnippet
                    : activeTab === 'fetch'
                      ? fetchSnippet
                      : activeTab === 'vite'
                        ? viteSnippet
                        : nextSnippet,
                )
              }
              className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-sky-300 cursor-pointer"
            >
              <Copy size={11} /> {t('integrationCopySnippet')}
            </button>
          </header>
          <CodeBlock
            code={
              activeTab === 'axios'
                ? axiosSnippet
                : activeTab === 'fetch'
                  ? fetchSnippet
                  : activeTab === 'vite'
                    ? viteSnippet
                    : nextSnippet
            }
          />
        </div>
      </section>
    </div>
  );
};

export default IntegrationGuidePage;

