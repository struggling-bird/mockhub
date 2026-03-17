/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ApiTable from './pages/ApiTable';
import ProxyConfig from './pages/ProxyConfig';
import PublicAssets from './pages/PublicAssets';
import TeamManagement from './pages/TeamManagement';
import ProjectManagement from './pages/ProjectManagement';
import ProjectForm from './pages/ProjectForm';
import Auth from './pages/Auth';
import { Bell, ChevronDown } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    () => window.localStorage.getItem('mockhub_project_id'),
  );
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const token = window.localStorage.getItem('mockhub_token');
    if (!token) {
      setAuthChecked(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          window.localStorage.removeItem('mockhub_token');
        }
      } catch {
        // 网络异常时不强制退出登录，仅保持当前状态
      } finally {
        setAuthChecked(true);
      }
    })();
  }, []);

  // 加载项目列表，用于顶部项目选择器
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = window.localStorage.getItem('mockhub_token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { id: string; name: string }[];
        setProjects(data);
        if (!currentProjectId && data.length > 0) {
          setCurrentProjectId(data[0].id);
          window.localStorage.setItem('mockhub_project_id', data[0].id);
          window.localStorage.setItem('mockhub_project_name', data[0].name);
        }
      } catch {
        // 忽略错误
      }
    })();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    const token = window.localStorage.getItem('mockhub_token');
    window.localStorage.removeItem('mockhub_token');
    setIsAuthenticated(false);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
    } catch {
      // 忽略网络错误
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  const getViewTitle = () => {
    const path = location.pathname;
    if (path === '/') return t('dashboard');
    if (path.startsWith('/projects/new')) return t('createProject');
    if (path.startsWith('/projects/edit')) return t('editProject') || 'Edit Project';
    if (path.startsWith('/projects')) return t('projects');
    if (path.startsWith('/apis')) return t('apis');
    if (path.startsWith('/proxies')) return t('proxies');
    if (path.startsWith('/assets')) return t('assets');
    if (path.startsWith('/team')) return t('team');
    if (path.startsWith('/stats')) return t('stats');
    return t('appName');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900">{getViewTitle()}</h1>
            <div className="h-4 w-px bg-slate-200 mx-2" />
            <div className="relative">
              <button
                className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 cursor-pointer"
                onClick={() => setProjectPickerOpen((o) => !o)}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {t('projects')}:{' '}
                <span className="text-slate-900">
                  {projects.find((p) => p.id === currentProjectId)?.name ||
                    window.localStorage.getItem('mockhub_project_name') ||
                    '—'}
                </span>
                <ChevronDown size={12} />
              </button>
              {projectPickerOpen && projects.length > 0 && (
                <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      className={`w-full px-3 py-1.5 text-xs text-left hover:bg-slate-50 ${
                        p.id === currentProjectId ? 'text-blue-600 font-semibold' : 'text-slate-600'
                      }`}
                      onClick={() => {
                        setCurrentProjectId(p.id);
                        window.localStorage.setItem('mockhub_project_id', p.id);
                        window.localStorage.setItem('mockhub_project_name', p.name);
                        setProjectPickerOpen(false);
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${language === 'zh' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
              >
                中文
              </button>
            </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button
              className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              onClick={handleLogout}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                DS
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">Dong S.</p>
                <p className="text-[10px] text-slate-400">Admin</p>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<ProjectManagement />} />
              <Route path="/projects/new" element={<ProjectForm />} />
              <Route path="/projects/edit/:id" element={<ProjectForm />} />
              <Route path="/apis" element={<ApiTable />} />
              <Route path="/proxies" element={<ProxyConfig />} />
              <Route path="/assets" element={<PublicAssets />} />
              <Route path="/team" element={<TeamManagement />} />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                      <ChevronDown size={32} />
                    </div>
                    <p className="text-lg font-medium">{t('moduleUnderDevelopment')}</p>
                    <p className="text-sm">{t('moduleComingSoon')}</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}
