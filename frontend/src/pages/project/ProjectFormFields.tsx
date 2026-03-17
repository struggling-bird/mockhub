import React from 'react';
import { Globe, Info, LayoutGrid, Save, Users } from 'lucide-react';
import SelectableInput from '../../components/SelectableInput';
import type { ProjectFormData } from './types';

interface ProjectFormFieldsProps {
  t: (key: string) => string;
  isEdit: boolean;
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  onCancel: () => void;
}

const ProjectFormFields: React.FC<ProjectFormFieldsProps> = ({
  t,
  isEdit,
  formData,
  setFormData,
  onCancel,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <LayoutGrid size={12} />
            {t('projectName')}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={t('projectNamePlaceholder')}
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Users size={12} />
            {t('initialMembers')}
          </label>
          <SelectableInput
            options={[
              t('membersJustMe'),
              t('membersSmallTeam'),
              t('membersLargeTeam'),
            ]}
            value={
              formData.members === '1'
                ? t('membersJustMe')
                : formData.members === '3'
                  ? t('membersSmallTeam')
                  : t('membersLargeTeam')
            }
            onChange={(val) => {
              const mapping: Record<string, string> = {
                [t('membersJustMe')]: '1',
                [t('membersSmallTeam')]: '3',
                [t('membersLargeTeam')]: '10',
              };
              setFormData((prev) => ({
                ...prev,
                members: mapping[val],
              }));
            }}
            allowCustom={false}
            showSearch={false}
            size="md"
            inputClassName="bg-slate-50"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Info size={12} />
          {t('projectDesc')}
        </label>
        <textarea
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
          placeholder={t('projectDescPlaceholder')}
        />
      </div>

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Globe size={12} />
          {t('proxyUrl')}
        </label>
        <input
          type="url"
          value={formData.proxyUrl}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, proxyUrl: e.target.value }))
          }
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          placeholder={t('proxyUrlPlaceholder')}
        />
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition-all cursor-pointer"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Save size={14} />
          {isEdit ? t('saveUpdateProject') : t('saveCreateProject')}
        </button>
      </div>
    </>
  );
};

export default ProjectFormFields;
