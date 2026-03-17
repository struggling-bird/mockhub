import React from 'react';
import { Database, Plus, Search, ExternalLink, Copy, Tag } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PublicAssets: React.FC = () => {
  const { t } = useLanguage();

  const assets = [
    {
      name: t('assetsNameAuthEndpoint'),
      value: 'https://api.mockdev.io/auth/v1',
      type: 'URL',
      category: t('assetsCategoryInfrastructure'),
    },
    {
      name: t('assetsNameUserRoles'),
      value: 'ADMIN, EDITOR, VIEWER, GUEST',
      type: 'Enum',
      category: t('assetsCategoryDefinitions'),
    },
    {
      name: t('assetsNameErrorCodes'),
      value: 'ERR_001, ERR_002, ERR_003',
      type: 'Enum',
      category: t('assetsCategoryDefinitions'),
    },
    {
      name: t('assetsNameCdnBase'),
      value: 'https://static.mockdev.io/assets/',
      type: 'URL',
      category: t('assetsCategoryInfrastructure'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t('publicAssetsTitle')}</h2>
          <p className="text-sm text-slate-500">{t('publicAssetsDesc')}</p>
        </div>
        <button type="button" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer">
          <Plus size={16} />
          {t('publicAssetsAdd')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assets.map((asset, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded">
                  {asset.type === 'URL' ? <ExternalLink size={14} /> : <Tag size={14} />}
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{asset.category}</span>
              </div>
              <button type="button" className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                <Copy size={16} />
              </button>
            </div>
            <h3 className="font-bold text-slate-900 mb-1">{asset.name}</h3>
            <div className="mono text-xs text-blue-600 bg-blue-50/50 p-3 rounded-lg border border-blue-100 break-all">
              {asset.value}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 text-slate-400">
          <Database size={24} />
        </div>
        <h4 className="font-semibold text-slate-900">{t('publicAssetsEmptyTitle')}</h4>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          {t('publicAssetsEmptyDesc')}
        </p>
      </div>
    </div>
  );
};

export default PublicAssets;
