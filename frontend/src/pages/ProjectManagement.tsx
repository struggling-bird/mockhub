import React, { useEffect, useState } from 'react';
import { FolderPlus, UserPlus, MoreVertical, Users, LayoutGrid, Edit3, Key, Copy } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { normalizeLogoUrlForPreview } from '../utils/logoUrl';

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  logoUrl?: string | null;
}

const ProjectManagement: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('mockhub_token');
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || '加载项目列表失败');
        } else {
          const data = (await res.json()) as ProjectItem[];
          setProjects(data);
        }
      } catch {
        setError('网络异常，无法加载项目列表');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{t('myProjects')}</h2>
          <p className="text-xs text-slate-500">Manage your development environments and team access.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
            <UserPlus size={14} />
            {t('joinProject')}
          </button>
          <Link 
            to="/projects/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            <FolderPlus size={14} />
            {t('createProject')}
          </Link>
        </div>
      </div>

      {loading && (
        <p className="text-xs text-slate-400">Loading projects...</p>
      )}
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group flex flex-col relative"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors overflow-hidden">
                  {project.logoUrl ? (
                    <img
                      src={normalizeLogoUrlForPreview(project.logoUrl)}
                      alt="logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <LayoutGrid size={18} />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-xs leading-tight">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-0.5 relative">
                <Link
                  to={`/projects/edit/${project.id}`}
                  className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit3 size={12} />
                </Link>
                <button
                  className="p-1 text-slate-400 hover:text-slate-600"
                  onClick={() =>
                    setMenuOpenId((prev) => (prev === project.id ? null : project.id))
                  }
                >
                  <MoreVertical size={12} />
                </button>
                {menuOpenId === project.id && (
                  <div className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <button
                      className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left"
                      onClick={async () => {
                        const name = window.prompt('重命名项目', project.name);
                        if (!name || name === project.name) {
                          setMenuOpenId(null);
                          return;
                        }
                        const token = window.localStorage.getItem('mockhub_token');
                        if (!token) {
                          setMenuOpenId(null);
                          return;
                        }
                        try {
                          const res = await fetch(`/api/projects/${project.id}`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ name }),
                          });
                          if (res.ok) {
                            setProjects((prev) =>
                              prev.map((p) =>
                                p.id === project.id ? { ...p, name } : p,
                              ),
                            );
                          } else {
                            alert('重命名失败');
                          }
                        } catch {
                          alert('网络异常，重命名失败');
                        } finally {
                          setMenuOpenId(null);
                        }
                      }}
                    >
                      重命名
                    </button>
                    <button
                      className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 text-left"
                      onClick={async () => {
                        if (!window.confirm('确定要删除该项目吗？')) {
                          setMenuOpenId(null);
                          return;
                        }
                        const token = window.localStorage.getItem('mockhub_token');
                        if (!token) {
                          setMenuOpenId(null);
                          return;
                        }
                        try {
                          const res = await fetch(`/api/projects/${project.id}`, {
                            method: 'DELETE',
                            headers: {
                              Authorization: `Bearer ${token}`,
                            },
                          });
                          if (res.ok) {
                            setProjects((prev) =>
                              prev.filter((p) => p.id !== project.id),
                            );
                          } else {
                            alert('删除失败');
                          }
                        } catch {
                          alert('网络异常，删除失败');
                        } finally {
                          setMenuOpenId(null);
                        }
                      }}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
              {project.description || 'No description'}
            </p>

            <div className="bg-slate-50 rounded-lg p-1.5 mb-3 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <Key size={10} className="text-slate-400 shrink-0" />
                  <code className="text-[8px] font-mono text-slate-500 truncate">
                    {/* 后端暂未提供 mockKey，这里使用占位，后续可接入真实字段 */}
                    mk_live_placeholder
                  </code>
                </div>
                <button 
                  onClick={() => copyToClipboard('mk_live_placeholder')}
                  className="p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                  title={t('copyKey')}
                >
                  <Copy size={10} />
                </button>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1 text-[9px] text-slate-500">
                  <Users size={10} />
                  1
                </div>
                <div className="text-[9px] text-slate-400">You</div>
              </div>
              <Link
                to="/"
                className="text-[10px] text-blue-600 font-bold hover:underline"
                onClick={() => {
                  window.localStorage.setItem('mockhub_project_id', project.id);
                  window.localStorage.setItem('mockhub_project_name', project.name);
                }}
              >
                {t('projectsEnter')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;
