import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Key, Shield, ArrowRight, GraduationCap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin, addNotification } = useAppStore();
  const [accessKey, setAccessKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) {
      addNotification('warning', 'Please enter the School Access Key.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const success = loginAdmin(accessKey.trim());
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      const { adminAccessKey } = useAppStore.getState();
      if (adminAccessKey && adminAccessKey.trim()) {
        addNotification('error', 'Invalid Access Key. Please verify and try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden" style={{ background: 'var(--uch-bg)' }}>
      {/* Top right Theme Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center pt-16 pb-8 px-6 text-center">
        {/* Crest */}
        <div className="w-20 h-20 rounded-full bg-gold-gradient flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-5 animate-fade-in badge-fill">
          <Shield size={38} className="text-white" />
        </div>
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--uch-fg)' }}>SONUCH</h1>
          <p className="text-amber-600 dark:text-amber-400 font-semibold text-sm mt-1 tracking-wide uppercase">
            Administration Portal Access
          </p>
          <p className="text-uch-muted text-xs mt-1 font-medium">Secure Staff Access Only</p>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-start justify-center px-5 pb-12">
        <div
          className="w-full max-w-sm glass-card p-6 shadow-2xl animate-slide-up border-amber-500/20"
          style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
        >
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={18} className="text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-bold" style={{ color: 'var(--uch-fg)' }}>Admin Access</h2>
          </div>
          <p className="text-uch-muted text-sm mb-6">
            Enter your School Access Key to proceed.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="access-key" className="uch-label">
                School Access Key
              </label>
              <div className="relative">
                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-uch-muted" />
                <input
                  id="access-key"
                  type={showKey ? 'text' : 'password'}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Input access key"
                  className="uch-input pl-10 pr-11 font-mono tracking-wider"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-uch-muted hover:opacity-80 transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="admin-login-btn"
              className="uch-btn-gold w-full flex items-center justify-center gap-2 h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Admin Portal
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="relative z-10 pb-8 text-center">
        <p className="text-uch-muted text-xs opacity-60">
          © 2026 University College Hospital, Ibadan · School of Nursing
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
