import React from 'react';
import { FolderPlus, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectManagementHeaderProps {
  title: string;
  description: string;
  joinText: string;
  createText: string;
}

const ProjectManagementHeader: React.FC<ProjectManagementHeaderProps> = ({
  title,
  description,
  joinText,
  createText,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer">
          <UserPlus size={14} />
          {joinText}
        </button>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <FolderPlus size={14} />
          {createText}
        </Link>
      </div>
    </div>
  );
};

export default ProjectManagementHeader;
