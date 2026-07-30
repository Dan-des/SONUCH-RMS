import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Hash, GraduationCap, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ThemeToggle } from '../../components/ThemeToggle';

export function StudentLogin() {
  const navigate = useNavigate();
  const { loginStudent, addNotification } = useAppStore();
  const [matricNo, setMatricNo] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNo.trim() || !pin.trim()) {
      addNotification('warning', 'Please enter both Matriculation Number and PIN.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const success = loginStudent(matricNo.trim(), pin.trim());
    if (success) {
      navigate('/student/dashboard');
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      addNotification('error', 'Invalid Matriculation Number or PIN. Please try again.');
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-8 px-6 text-center">
        {/* Crest */}
        <div className="w-20 h-20 rounded-full bg-accent-gradient flex items-center justify-center shadow-2xl shadow-teal-500/30 mb-5 animate-fade-in badge-fill">
          <GraduationCap size={38} className="text-white" />
        </div>
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold leading-tight" style={{ color: 'var(--uch-fg)' }}>
            SONUCH
          </h1>
          <p className="text-teal-600 dark:text-teal-400 font-semibold text-sm mt-1 tracking-wide uppercase">
            Result Management System
          </p>
          <p className="text-uch-muted text-xs mt-1 font-medium">Student Portal Access</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-5 pb-12">
        <div
          className={`w-full max-w-sm glass-card p-6 shadow-2xl animate-slide-up ${
            shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
          style={shake ? { animation: 'shake 0.5s ease-in-out' } : {}}
        >
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--uch-fg)' }}>Welcome Back</h2>
          <p className="text-uch-muted text-sm mb-6">
            Sign in to access your academic records.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Matric Number */}
            <div>
              <label htmlFor="matricNo" className="uch-label">
                Matriculation Number
              </label>
              <div className="relative">
                <Hash
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-uch-muted"
                />
                <input
                  id="matricNo"
                  type="text"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  placeholder="Input matriculation number"
                  className="uch-input pl-10"
                  autoComplete="username"
                  autoCapitalize="characters"
                />
              </div>
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="studentPin" className="uch-label">
                Security PIN
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-uch-muted"
                />
                <input
                  id="studentPin"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter your PIN"
                  className="uch-input pl-10 pr-11"
                  autoComplete="current-password"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-uch-muted hover:opacity-80 transition-colors"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="uch-btn-primary w-full mt-2 flex items-center justify-center gap-2 h-12"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
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
