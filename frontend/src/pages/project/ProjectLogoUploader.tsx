import React from 'react';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { normalizeLogoUrlForPreview } from '../../utils/logoUrl';

interface ProjectLogoUploaderProps {
  logo: string;
  uploading: boolean;
  projectLogoText: string;
  projectLogoDescText: string;
  projectLogoUploadingText: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProjectLogoUploader: React.FC<ProjectLogoUploaderProps> = ({
  logo,
  uploading,
  projectLogoText,
  projectLogoDescText,
  projectLogoUploadingText,
  onFileChange,
}) => {
  return (
    <div className="flex items-center gap-6">
      <label className="relative group cursor-pointer">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-all overflow-hidden">
          {logo ? (
            <img
              src={normalizeLogoUrlForPreview(logo)}
              alt="Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <ImageIcon size={28} />
          )}
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-blue-600 text-white rounded-xl shadow-lg group-hover:bg-blue-700 transition-all text-[10px] pointer-events-none flex items-center justify-center">
          <Upload size={12} />
        </div>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.bmp,.tif,.tiff,.avif,.heic,.heif,image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </label>
      <div className="flex-1 space-y-0.5">
        <h4 className="text-xs font-bold text-slate-900">{projectLogoText}</h4>
        <p className="text-[10px] text-slate-500">
          {uploading ? projectLogoUploadingText : projectLogoDescText}
        </p>
      </div>
    </div>
  );
};

export default ProjectLogoUploader;
