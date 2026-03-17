import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { request, ApiError } from '../../utils/http';
import ProjectManagementHeader from './ProjectManagementHeader';
import ProjectCard from './ProjectCard';
import type { ProjectItem } from './types';

const ProjectListPage: React.FC = () => {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await request<ProjectItem[]>('/api/projects');
        setProjects(data);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message || t('projectsLoadError'));
        } else {
          setError(t('projectsNetworkError'));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <ProjectManagementHeader
        title={t('myProjects')}
        description={t('projectsDesc')}
        joinText={t('joinProject')}
        createText={t('createProject')}
      />

      {loading && (
        <p className="text-xs text-slate-400">{t('projectsLoading')}</p>
      )}
      {error && (
        <p className="text-xs text-rose-500">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            t={t}
            isMenuOpen={menuOpenId === project.id}
            onToggleMenu={() =>
              setMenuOpenId((prev) => (prev === project.id ? null : project.id))
            }
            onCopyMockKey={() => copyToClipboard('mk_live_placeholder')}
            onRename={async () => {
              const name = window.prompt(t('projectRenamePrompt'), project.name);
              if (!name || name === project.name) {
                setMenuOpenId(null);
                return;
              }
              try {
                await request(`/api/projects/${project.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ name }),
                });
                setProjects((prev) =>
                  prev.map((p) => (p.id === project.id ? { ...p, name } : p)),
                );
              } catch {
                alert(t('projectRenameFailed'));
              } finally {
                setMenuOpenId(null);
              }
            }}
            onDelete={async () => {
              if (!window.confirm(t('projectDeleteConfirm'))) {
                setMenuOpenId(null);
                return;
              }
              try {
                await request(`/api/projects/${project.id}`, {
                  method: 'DELETE',
                });
                setProjects((prev) => prev.filter((p) => p.id !== project.id));
              } catch {
                alert(t('projectDeleteFailed'));
              } finally {
                setMenuOpenId(null);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectListPage;
