import React from 'react';
import {
  Copy,
  Edit3,
  Key,
  LayoutGrid,
  MoreVertical,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { normalizeLogoUrlForPreview } from '../../utils/logoUrl';
import type { ProjectItem } from './types';

interface ProjectCardProps {
  project: ProjectItem;
  t: (key: string) => string;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onRename: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onCopyMockKey: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  t,
  isMenuOpen,
  onToggleMenu,
  onRename,
  onDelete,
  onCopyMockKey,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all group flex flex-col relative">
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
                {t('projectStatusActive')}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 relative">
          <Link
            to={`/projects/edit/${project.id}`}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
          >
            <Edit3 size={12} />
          </Link>
          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            onClick={onToggleMenu}
          >
            <MoreVertical size={12} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 top-7 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
              <button
                type="button"
                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                onClick={onRename}
              >
                {t('projectRename')}
              </button>
              <button
                type="button"
                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                onClick={onDelete}
              >
                {t('projectDelete')}
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mb-3 line-clamp-1">
        {project.description || t('projectNoDescription')}
      </p>

      <div className="bg-slate-50 rounded-lg p-1.5 mb-3 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <Key size={10} className="text-slate-400 shrink-0" />
            <code className="text-[8px] font-mono text-slate-500 truncate">
              mk_live_placeholder
            </code>
          </div>
          <button
            type="button"
            onClick={onCopyMockKey}
            className="p-0.5 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
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
          <div className="text-[9px] text-slate-400">{t('projectCurrentUser')}</div>
        </div>
        <Link
          to="/"
          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
          onClick={() => {
            window.localStorage.setItem('mockhub_project_id', project.id);
            window.localStorage.setItem('mockhub_project_name', project.name);
          }}
        >
          {t('projectsEnter')}
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
