import { useState, useRef, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Home,
  LogOut,
  CalendarDays,
  Menu,
  X,
  Sliders,
  Users,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateDynamicSessions } from '../../types';
import { AcademicPolicyModal } from './components/AcademicPolicyModal';
import { RosterExportModal } from './components/RosterExportModal';
import { ThemeToggle } from '../../components/ThemeToggle';

export function AdminPortal({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    logoutAdmin,
    activeSystemSession,
    setActiveSystemSession,
    academicPolicy,
    results,
    students,
  } = useAppStore();

  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowNavMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const getViewLabel = () => {
    if (location.pathname.startsWith('/admin/roster')) return 'Student Roster Directory';
    if (location.pathname.startsWith('/admin/results')) return 'Result Processing Grid';
    if (location.pathname.startsWith('/admin/settings')) return 'Academic Policy & Settings';
    return 'Dashboard';
  };

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--uch-bg)' }}>
      {/* Top Header */}
      <header
        className="no-print sticky top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-md"
        style={{ background: 'var(--uch-surface)', borderBottom: '1px solid var(--uch-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link to="/admin/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.png"
              alt="School of Nursing, UCH Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="leading-tight">
            <p className="font-bold text-sm leading-none" style={{ color: 'var(--uch-fg)' }}>SONUCH Admin Portal</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--uch-muted)' }}>
              {getViewLabel()}
            </p>
          </div>
        </div>

        {/* Header Right Controls & Menu */}
        <div className="flex items-center gap-2">
          {/* Active System Session */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50/80 dark:bg-uch-card border border-emerald-200/60 dark:border-uch-border shadow-sm">
            <CalendarDays size={13} className="text-orange-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold hidden md:inline text-slate-700 dark:text-uch-muted">
              System Session:
            </span>
            <select
              id="global-system-session-select"
              value={activeSystemSession}
              onChange={(e) => setActiveSystemSession(e.target.value)}
              className="uch-select text-xs py-1 px-2 font-bold text-orange-600 dark:text-orange-400 cursor-pointer bg-transparent border-0 focus:ring-0"
            >
              {generateDynamicSessions([
                ...results.map((r) => r.academicSession),
                ...students.map((s) => s.entrySession),
              ]).map((s) => (
                <option key={s} value={s} className="bg-uch-surface text-uch-fg">
                  {s}
                </option>
              ))}
            </select>
          </div>

          <ThemeToggle />

          {/* Admin Navigation Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              id="admin-nav-menu-btn"
              onClick={() => setShowNavMenu(!showNavMenu)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm bg-white dark:bg-uch-card text-slate-900 dark:text-white border border-slate-200 dark:border-uch-border hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-uch-surface"
            >
              {showNavMenu ? <X size={15} /> : <Menu size={15} />}
              <span className="hidden sm:inline">Menu</span>
              {!academicPolicy.isConfigured && (
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              )}
            </button>

            {/* Dropdown Card */}
            {showNavMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border border-slate-200 dark:border-uch-border p-2 z-50 animate-slide-down bg-white dark:bg-uch-surface">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-uch-border/40 mb-1 rounded-xl bg-emerald-50/50 dark:bg-transparent">
                  <p className="text-xs font-bold text-orange-600 dark:text-orange-400">System Configuration &amp; Portals</p>
                  <p className="text-[10px] text-slate-600 dark:text-uch-muted">Admin settings and student management</p>
                </div>

                <div className="space-y-1">
                  {/* Academic Policy & Grading System */}
                  <button
                    id="menu-academic-policy"
                    onClick={() => {
                      setShowNavMenu(false);
                      setShowPolicyModal(true);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-orange-50 dark:hover:bg-uch-card transition-colors text-left text-slate-900 dark:text-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <Sliders size={14} />
                      </div>
                      <div>
                        <p className="leading-tight">Academic Policy &amp; Grading</p>
                        <p className="text-[10px] text-slate-500 dark:text-uch-muted font-normal">
                          {academicPolicy.isConfigured ? `${academicPolicy.maxCA}/${academicPolicy.maxExam} Ratio · ${academicPolicy.matricPrefix}` : 'Unconfigured'}
                        </p>
                      </div>
                    </div>
                    {!academicPolicy.isConfigured && (
                      <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[9px] font-bold">
                        SETUP
                      </span>
                    )}
                  </button>

                  {/* Student Directory & Roster Export */}
                  <button
                    id="menu-roster-export"
                    onClick={() => {
                      setShowNavMenu(false);
                      setShowExportModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-orange-50 dark:hover:bg-uch-card transition-colors text-left text-slate-900 dark:text-white"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-teal-500/20 flex items-center justify-center text-emerald-700 dark:text-teal-400">
                      <Download size={14} />
                    </div>
                    <div>
                      <p className="leading-tight">Student Directory &amp; CSV Export</p>
                      <p className="text-[10px] text-slate-500 dark:text-uch-muted font-normal">Download level rosters &amp; profiles</p>
                    </div>
                  </button>

                  {/* Result Processing */}
                  <Link
                    to="/admin/results"
                    onClick={() => setShowNavMenu(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                      location.pathname.startsWith('/admin/results')
                        ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-500/30'
                        : 'hover:bg-orange-50 dark:hover:bg-uch-card text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-teal-500/20 flex items-center justify-center text-emerald-700 dark:text-teal-400">
                      <FileSpreadsheet size={14} />
                    </div>
                    <span>Result Processing Grid</span>
                  </Link>

                  {/* Student Roster */}
                  <Link
                    to="/admin/roster"
                    onClick={() => setShowNavMenu(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                      location.pathname.startsWith('/admin/roster')
                        ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-500/30'
                        : 'hover:bg-orange-50 dark:hover:bg-uch-card text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-700 dark:text-blue-400">
                      <Users size={14} />
                    </div>
                    <span>Enrollment &amp; Roster</span>
                  </Link>

                  {/* Hub */}
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowNavMenu(false)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold border border-orange-200 dark:border-orange-500/30'
                        : 'hover:bg-orange-50 dark:hover:bg-uch-card text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <Home size={14} />
                    </div>
                    <span>Admin Dashboard</span>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-uch-border/40 pt-1 mt-1">
                    <button
                      id="menu-logout-btn"
                      onClick={() => {
                        setShowNavMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        className="no-print fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md md:hidden"
        style={{ background: 'var(--uch-surface)', borderTop: '1px solid var(--uch-border)' }}
      >
        <div className="flex items-stretch max-w-md mx-auto">
          {[
            { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
            { path: '/admin/results', label: 'Results', icon: FileSpreadsheet },
            { path: '/admin/roster', label: 'Roster', icon: Users },
          ].map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`tab-bar-btn flex-1 flex flex-col items-center justify-center text-center py-2 relative ${
                  isActive ? 'active text-orange-600 dark:text-orange-400 font-bold' : 'inactive text-uch-muted'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-orange-500"
                  />
                )}
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                <span className="text-[10px] mt-0.5 leading-none">{label}</span>
              </Link>
            );
          })}
          <button
            id="admin-mobile-tab-settings"
            onClick={() => setShowPolicyModal(true)}
            className="tab-bar-btn flex-1 flex flex-col items-center justify-center text-center py-2 relative inactive text-uch-muted"
          >
            <Sliders size={19} strokeWidth={1.8} />
            <span className="text-[10px] mt-0.5 leading-none">Settings</span>
          </button>
        </div>
      </nav>

      {/* Academic Policy Modal */}
      {showPolicyModal && (
        <AcademicPolicyModal onClose={() => setShowPolicyModal(false)} />
      )}

      {/* Roster Export Modal */}
      {showExportModal && (
        <RosterExportModal onClose={() => setShowExportModal(false)} />
      )}
    </div>
  );
}
