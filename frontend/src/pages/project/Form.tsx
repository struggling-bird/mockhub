import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { request } from '../../utils/http';
import ProjectFormFields from './ProjectFormFields';
import ProjectFormHeader from './ProjectFormHeader';
import ProjectLogoUploader from './ProjectLogoUploader';
import type { ProjectFormData } from './types';

const ProjectFormPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    proxyUrl: '',
    members: '1',
    logo: '',
    defaultMockMode: 'static',
  });
  const [uploading, setUploading] = useState(false);
  const initialLogoRef = useRef('');
  const tempLogoRef = useRef<string | null>(null);
  const skipCleanupRef = useRef(false);

  const cleanupLogo = async (logoUrl?: string | null) => {
    if (!logoUrl) return;
    try {
      await request('/api/upload/logo/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: logoUrl }),
      });
    } catch {
      // 清理失败不阻断主流程
    }
  };

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const data = await request<{
          name: string;
          description?: string | null;
          logoUrl?: string | null;
          proxyUrl?: string | null;
          defaultMockMode?: 'static' | 'script' | 'proxy';
        }>(`/api/projects/${id}`);
        setFormData((prev) => ({
          ...prev,
          name: data.name || '',
          description: data.description || '',
          logo: data.logoUrl || '',
          proxyUrl: data.proxyUrl || '',
          defaultMockMode: data.defaultMockMode || 'static',
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

    if (!formData.proxyUrl.trim()) {
      alert(t('proxyUrl') + ' ' + t('projectSaveError'));
      return;
    }

    try {
      const url = isEdit && id ? `/api/projects/${id}` : '/api/projects';
      const method = isEdit && id ? 'PUT' : 'POST';
      await request(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          logoUrl: formData.logo || undefined,
          proxyUrl: formData.proxyUrl,
          defaultMockMode: formData.defaultMockMode,
        }),
      });
      skipCleanupRef.current = true;
      initialLogoRef.current = formData.logo || '';
      tempLogoRef.current = null;
      navigate('/projects');
    } catch {
      alert(t('projectSaveError'));
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = await request<{ url: string }>('/api/upload/logo', {
        method: 'POST',
        body: fd,
      });
      const previousTempLogo = tempLogoRef.current;
      if (previousTempLogo && previousTempLogo !== data.url) {
        await cleanupLogo(previousTempLogo);
      }
      tempLogoRef.current = data.url;
      skipCleanupRef.current = false;
      setFormData((prev) => ({ ...prev, logo: data.url }));
    } catch {
      alert(t('projectLogoUploadError'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <ProjectFormHeader
          title={isEdit ? t('editProject') : t('createProject')}
          subtitle={isEdit ? t('editProjectSubtitle') : t('createProjectSubtitle')}
          onBack={() => void handleCancel()}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 space-y-6">
            <ProjectLogoUploader
              logo={formData.logo}
              uploading={uploading}
              projectLogoText={t('projectLogo')}
              projectLogoDescText={t('projectLogoDesc')}
              projectLogoUploadingText={t('projectLogoUploading')}
              onFileChange={(e) => void handleLogoChange(e)}
            />

            <ProjectFormFields
              t={t}
              isEdit={isEdit}
              formData={formData}
              setFormData={setFormData}
              onCancel={() => void handleCancel()}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProjectFormPage;
