import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Users,
  Code2,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { request } from '../../utils/http';
import { formatLastCall } from '../../utils/relativeTime';

interface DashboardSummary {
  stats: {
    totalApis: number;
    activeProxies: number;
    teamMembers: number;
    requestsPerHour: number;
  };
  recentActivity: {
    id: string;
    title: string;
    subtitle: string;
    mode: string;
    statusCode: number;
    durationMs: number;
    createdAt: string;
  }[];
  systemStatus: {
    proxyEngine: string;
    mockStorage: string;
    authService: string;
  };
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    request<DashboardSummary>('/api/dashboard/summary')
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Dashboard data unavailable');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        label: t('totalApis'),
        value: String(summary?.stats.totalApis ?? 0),
        icon: Code2,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
      },
      {
        label: t('activeProxies'),
        value: String(summary?.stats.activeProxies ?? 0),
        icon: Globe,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
      },
      {
        label: t('team'),
        value: String(summary?.stats.teamMembers ?? 1),
        icon: Users,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
      },
      {
        label: t('requestsHr'),
        value: String(summary?.stats.requestsPerHour ?? 0),
        icon: Activity,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
      },
    ],
    [summary, t],
  );

  const statusLabel = (status: string) =>
    status === 'latency' ? t('statusLatency') : t('statusOperational');
  const isLatency = (status: string) => status === 'latency';

  return (
    <div className="space-y-6">
      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-slate-400 text-[10px] font-bold flex items-center gap-0.5">
                {loading ? '...' : 'LIVE'}
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
            <button type="button" className="text-[10px] text-blue-600 font-medium hover:underline cursor-pointer">
              {t('viewAll')}
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {(summary?.recentActivity ?? []).length === 0 ? (
              <div className="p-6 text-xs text-slate-400">
                {loading ? 'Loading...' : 'No recent gateway requests'}
              </div>
            ) : (
              summary?.recentActivity.map((activity) => {
                const success = activity.statusCode < 400;
                return (
                  <div key={activity.id} className="p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Clock size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-900 truncate">{activity.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {activity.subtitle} · {activity.mode} · {activity.durationMs}ms ·{' '}
                        {formatLastCall(activity.createdAt)}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                        success
                          ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                          : 'text-rose-600 bg-rose-50 border-rose-100'
                      }`}
                    >
                      {success ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                      {activity.statusCode}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t('systemStatus')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{t('statusProxyEngine')}</span>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isLatency(summary?.systemStatus.proxyEngine || '') ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isLatency(summary?.systemStatus.proxyEngine || '') ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {statusLabel(summary?.systemStatus.proxyEngine || 'operational')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{t('statusMockStorage')}</span>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isLatency(summary?.systemStatus.mockStorage || '') ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isLatency(summary?.systemStatus.mockStorage || '') ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {statusLabel(summary?.systemStatus.mockStorage || 'operational')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{t('statusAuthService')}</span>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold ${isLatency(summary?.systemStatus.authService || '') ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {isLatency(summary?.systemStatus.authService || '') ? <AlertCircle size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {statusLabel(summary?.systemStatus.authService || 'operational')}
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
            <button type="button" className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-bold transition-colors cursor-pointer">
              {t('teamTipCta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
