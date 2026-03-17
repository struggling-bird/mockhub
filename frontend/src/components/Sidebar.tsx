import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  Code2, 
  Users, 
  Settings, 
  Activity, 
  Database,
  FolderKanban,
  Zap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {}

const Sidebar: React.FC<SidebarProps> = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard, path: '/' },
    { id: 'apis', label: t('apis'), icon: Code2, path: '/interfaces' },
    { id: 'proxies', label: t('proxies'), icon: Globe, path: '/proxies' },
    { id: 'assets', label: t('assets'), icon: Database, path: '/assets' },
    { id: 'stats', label: t('stats'), icon: Activity, path: '/stats' },
  ];

  return (
    <div className="w-64 border-r border-slate-200 h-screen bg-white flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Zap size={24} fill="currentColor" />
          <span>{t('appBrand')}</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">
          {t('appTagline')}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="relative">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Settings size={18} />
            {t('settings')}
          </button>
          {settingsOpen && (
            <div className="absolute bottom-12 left-4 right-4 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              <Link
                to="/projects"
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${
                  location.pathname.startsWith('/projects')
                    ? 'text-blue-600'
                    : 'text-slate-600'
                }`}
                onClick={() => setSettingsOpen(false)}
              >
                <FolderKanban size={16} />
                {t('projects')}
              </Link>
              <Link
                to="/team"
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 ${
                  location.pathname.startsWith('/team')
                    ? 'text-blue-600'
                    : 'text-slate-600'
                }`}
                onClick={() => setSettingsOpen(false)}
              >
                <Users size={16} />
                {t('team')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
