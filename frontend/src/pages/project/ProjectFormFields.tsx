import React from 'react';
import { Globe, Info, LayoutGrid, Save, Shield, Users, Zap } from 'lucide-react';
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

      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <Zap size={12} />
          {t('projectDefaultStrategy')}
        </label>
        <SelectableInput
          options={[
            t('projectDefaultStrategyStatic'),
            t('projectDefaultStrategyScript'),
            t('projectDefaultStrategyProxy'),
          ]}
          value={
            formData.defaultMockMode === 'static'
              ? t('projectDefaultStrategyStatic')
              : formData.defaultMockMode === 'script'
                ? t('projectDefaultStrategyScript')
                : t('projectDefaultStrategyProxy')
          }
          onChange={(val) => {
            const mapping: Record<string, 'static' | 'script' | 'proxy'> = {
              [t('projectDefaultStrategyStatic')]: 'static',
              [t('projectDefaultStrategyScript')]: 'script',
              [t('projectDefaultStrategyProxy')]: 'proxy',
            };
            setFormData((prev) => ({
              ...prev,
              defaultMockMode: mapping[val] ?? 'static',
            }));
          }}
          allowCustom={false}
          showSearch={false}
          size="md"
          inputClassName="bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Zap size={12} />
            {t('projectAutoCapture')}
          </label>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, autoCapture: !prev.autoCapture }))
            }
            className={`w-full px-3 py-2 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
              formData.autoCapture
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <span className="font-bold">
              {formData.autoCapture ? t('enabled') : t('disabled')}
            </span>
            <span className="text-[10px] text-slate-400">
              {t('projectAutoCaptureHint')}
            </span>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Shield size={12} />
            {t('cookieRewrite')}
          </label>
          <SelectableInput
            options={[
              t('cookieRewriteOff'),
              t('cookieRewriteOrigin'),
              t('cookieRewriteCustom'),
            ]}
            value={
              formData.cookieRewriteMode === 'off'
                ? t('cookieRewriteOff')
                : formData.cookieRewriteMode === 'origin'
                  ? t('cookieRewriteOrigin')
                  : t('cookieRewriteCustom')
            }
            onChange={(val) => {
              const mapping: Record<string, 'off' | 'origin' | 'custom'> = {
                [t('cookieRewriteOff')]: 'off',
                [t('cookieRewriteOrigin')]: 'origin',
                [t('cookieRewriteCustom')]: 'custom',
              };
              const next = mapping[val] ?? 'off';
              setFormData((prev) => ({
                ...prev,
                cookieRewriteMode: next,
                cookieRewriteDomain:
                  next === 'custom' ? prev.cookieRewriteDomain : '',
              }));
            }}
            allowCustom={false}
            showSearch={false}
            size="md"
            inputClassName="bg-slate-50"
          />
        </div>
      </div>

      {formData.cookieRewriteMode === 'custom' && (
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Shield size={12} />
            {t('cookieRewriteDomain')}
          </label>
          <input
            type="text"
            value={formData.cookieRewriteDomain}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                cookieRewriteDomain: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            placeholder={t('cookieRewriteDomainPlaceholder')}
          />
        </div>
      )}

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
