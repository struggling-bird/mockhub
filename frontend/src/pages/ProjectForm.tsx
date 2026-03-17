import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, ArrowLeft, LayoutGrid, Info, Globe, Users, Key, Copy, CheckCircle2, ExternalLink, Image as ImageIcon, Upload } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SelectableInput from '../components/SelectableInput';
import { normalizeLogoUrlForPreview } from '../utils/logoUrl';

const ProjectForm: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    proxyUrl: '',
    members: '1',
    logo: '',
  });
  const [uploading, setUploading] = useState(false);
  const initialLogoRef = useRef('');
  const tempLogoRef = useRef<string | null>(null);
  const skipCleanupRef = useRef(false);

  const cleanupLogo = async (logoUrl?: string | null) => {
    if (!logoUrl) return;
    const token = window.localStorage.getItem('mockhub_token');
    if (!token) return;

    try {
      await fetch('/api/upload/logo/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: logoUrl }),
      });
    } catch {
      // 清理失败不阻断主流程
    }
  };

  useEffect(() => {
    if (!isEdit || !id) return;
    const token = window.localStorage.getItem('mockhub_token');
    if (!token) {
      navigate('/');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setFormData((prev) => ({
          ...prev,
          name: data.name || '',
          description: data.description || '',
          logo: data.logoUrl || '',
        }));
        initialLogoRef.current = data.logoUrl || '';
        tempLogoRef.current = null;
      } catch {
        // 忽略错误，使用默认表单
      }
    })();
  }, [isEdit, id, navigate]);

  useEffect(() => {
    return () => {
      if (!skipCleanupRef.current && tempLogoRef.current) {
        void cleanupLogo(tempLogoRef.current);
      }
    };
  }, []);

  const handleCancel = async () => {
    if (!skipCleanupRef.current && tempLogoRef.current) {
      await cleanupLogo(tempLogoRef.current);
      tempLogoRef.current = null;
    }
    navigate('/projects');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = window.localStorage.getItem('mockhub_token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const url = isEdit && id ? `/api/projects/${id}` : '/api/projects';
      const method = isEdit && id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          logoUrl: formData.logo || undefined,
        }),
      });
      if (!res.ok) {
        // 简单失败提示，后续可做成 toast
        alert('保存项目失败，请稍后重试');
        return;
      }
      skipCleanupRef.current = true;
      initialLogoRef.current = formData.logo || '';
      tempLogoRef.current = null;
      navigate('/projects');
    } catch {
      alert('网络异常，无法保存项目');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => void handleCancel()}
            className="p-2 hover:bg-white rounded-full border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isEdit ? t('editProject') || 'Edit Project' : t('createProject')}
            </h2>
            <p className="text-sm text-slate-500">
              {isEdit ? t('editProjectSubtitle') : t('createProjectSubtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 space-y-6">
            {/* Logo Upload */}
            <div className="flex items-center gap-6">
              <label className="relative group cursor-pointer">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-all overflow-hidden">
                  {formData.logo ? (
                    <img
                      src={normalizeLogoUrlForPreview(formData.logo)}
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
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const token = window.localStorage.getItem('mockhub_token');
                    if (!token) {
                      navigate('/');
                      return;
                    }
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await fetch('/api/upload/logo', {
                        method: 'POST',
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                        body: fd,
                      });
                      if (!res.ok) {
                        alert('Logo 上传失败，请稍后重试');
                      } else {
                        const data = await res.json();
                        const previousTempLogo = tempLogoRef.current;
                        if (previousTempLogo && previousTempLogo !== data.url) {
                          await cleanupLogo(previousTempLogo);
                        }
                        tempLogoRef.current = data.url;
                        skipCleanupRef.current = false;
                        setFormData((prev) => ({ ...prev, logo: data.url }));
                      }
                    } catch {
                      alert('网络异常，Logo 上传失败');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-bold text-slate-900">{t('projectLogo')}</h4>
                <p className="text-[10px] text-slate-500">
                  {uploading ? 'Logo 上传中…' : t('projectLogoDesc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Project Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <LayoutGrid size={12} />
                  {t('projectName')}
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={t('projectNamePlaceholder')}
                />
              </div>

              {/* Members */}
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
                    setFormData({ ...formData, members: mapping[val] });
                  }}
                  allowCustom={false}
                  showSearch={false}
                  size="md"
                  inputClassName="bg-slate-50"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Info size={12} />
                {t('projectDesc')}
              </label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                placeholder={t('projectDescPlaceholder')}
              />
            </div>

            {/* Proxy URL */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Globe size={12} />
                {t('proxyUrl')}
              </label>
              <input 
                type="url" 
                value={formData.proxyUrl}
                onChange={(e) => setFormData({ ...formData, proxyUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                placeholder={t('proxyUrlPlaceholder')}
              />
            </div>
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={() => void handleCancel()}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg transition-all"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Save size={14} />
              {isEdit ? t('saveUpdateProject') : t('saveCreateProject')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
