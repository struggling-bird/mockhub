import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ProjectFormHeaderProps {
  title: string;
  subtitle: string;
  onBack: () => void;
}

const ProjectFormHeader: React.FC<ProjectFormHeaderProps> = ({
  title,
  subtitle,
  onBack,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default ProjectFormHeader;
