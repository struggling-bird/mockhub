import React, { useState } from 'react';
import { Mail, Lock, User, Building, Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { t, language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { email, password, username, company };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || (isLogin ? '登录失败，请检查邮箱或密码' : '注册失败，请稍后重试'));
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.token) {
        window.localStorage.setItem('mockhub_token', data.token);
      }
      setLoading(false);
      onLogin();
    } catch (err) {
      console.error(err);
      setError('网络异常，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="absolute top-8 right-8 flex gap-2">
        <button 
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'en' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLanguage('zh')}
          className={`px-3 py-1 rounded text-xs font-bold transition-colors ${language === 'zh' ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
        >
          中文
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4">
            <Zap size={28} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('appName')}</h1>
          <p className="text-slate-500 text-sm mt-1">{isLogin ? t('welcomeBack') : t('createAccount')}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">{t('username')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder={t('usernamePlaceholder')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">{t('company')}</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder={t('companyPlaceholder')}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder={t('emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (isLogin ? '登录中...' : '注册中...') : isLogin ? t('login') : t('register')}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            {error && (
              <p className="text-sm text-rose-500 mb-3">
                {error}
              </p>
            )}
            <p className="text-sm text-slate-500">
              {isLogin ? t('noAccount') : t('hasAccount')}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-bold hover:underline"
              >
                {isLogin ? t('register') : t('login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
