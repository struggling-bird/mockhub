import React from 'react';
import { 
  Activity, 
  Users, 
  Code2, 
  Globe, 
  ArrowUpRight, 
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  const stats = [
    { label: t('totalApis'), value: '42', icon: Code2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('activeProxies'), value: '12', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('team'), value: '8', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: t('requestsHr'), value: '1.2k', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-emerald-500 text-[10px] font-bold flex items-center gap-0.5">
                +12% <ArrowUpRight size={10} />
              </span>
            </div>
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{t('recentActivity')}</h3>
            <button className="text-[10px] text-blue-600 font-medium hover:underline">
              {t('viewAll')}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Clock size={12} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-900">
                    {t('activityExample')}
                  </p>
                  <p className="text-[10px] text-slate-400">{t('activityTimeAgo')}</p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  <CheckCircle2 size={9} /> SUCCESS
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('systemStatus')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{t('statusProxyEngine')}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('statusOperational')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{t('statusMockStorage')}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('statusOperational')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{t('statusAuthService')}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                  <AlertCircle size={12} />
                  {t('statusLatency')}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <h3 className="text-sm font-semibold mb-1.5">{t('teamTipTitle')}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              {t('teamTipDesc').replace('Script Mode', '')}
              <span className="text-blue-400 mono"> {t('scriptMode')} </span>
            </p>
            <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-bold transition-colors">
              {t('teamTipCta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
