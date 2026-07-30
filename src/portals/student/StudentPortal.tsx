import { ReactNode } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, BookOpen, FileText, User, GraduationCap, LogOut } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ThemeToggle } from '../../components/ThemeToggle';

const TABS = [
  { path: '/student/dashboard', label: 'Dashboard', icon: Home },
  { path: '/student/courses', label: 'My Courses', icon: BookOpen },
  { path: '/student/results', label: 'Results & Transcript', icon: FileText },
  { path: '/student/profile', label: 'Profile', icon: User },
];

export function StudentPortal({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentStudentId, students, logoutStudent } = useAppStore();
  const student = students.find((s) => s.id === currentStudentId);

  const handleLogout = () => {
    logoutStudent();
    navigate('/student/login');
  };

  return (
    <div className="min-h-dvh flex flex-col relative pb-16 md:pb-0" style={{ background: 'var(--uch-bg)' }}>
      {/* Top Header */}
      <header
        className="no-print sticky top-0 z-40 flex items-center justify-between px-4 py-3 backdrop-blur-md"
        style={{ background: 'var(--uch-surface)', borderBottom: '1px solid var(--uch-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link to="/student/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/logo.png"
              alt="School of Nursing, UCH Logo"
              className="h-8 w-auto object-contain"
            />
          </Link>
          <div className="leading-tight">
            <p className="font-bold text-sm leading-none" style={{ color: 'var(--uch-fg)' }}>SONUCH Student Portal</p>
            <p className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--uch-muted)' }}>Student Result System</p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (≥ 768px) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-uch-card border border-uch-border">
          {TABS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-uch-accent text-white shadow-md'
                    : 'text-uch-muted hover:text-white hover:bg-uch-surface'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {student && (
            <Link
              to="/student/profile"
              className="flex items-center gap-2 cursor-pointer p-1 pr-2 rounded-full hover:bg-uch-card/60 transition-all border border-uch-border/40"
              title="View Profile"
            >
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-7 h-7 rounded-full object-cover border border-uch-accent" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-accent-gradient flex items-center justify-center text-white text-xs font-bold badge-fill">
                  {student.avatarInitials}
                </div>
              )}
              <span className="text-xs font-semibold hidden lg:inline max-w-[100px] truncate" style={{ color: 'var(--uch-fg)' }}>{student.firstName}</span>
            </Link>
          )}
          <ThemeToggle />
          <button
            id="student-logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-red-400"
            style={{ color: 'var(--uch-muted)' }}
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        className="no-print fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md md:hidden"
        style={{ background: 'var(--uch-surface)', borderTop: '1px solid var(--uch-border)' }}
      >
        <div className="flex items-stretch max-w-md mx-auto">
          {TABS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`tab-bar-btn flex-1 flex flex-col items-center justify-center text-center py-2 relative ${
                  isActive ? 'active text-uch-accent font-bold' : 'inactive text-uch-muted'
                }`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ background: 'var(--uch-accent)' }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${isActive ? 'scale-110' : 'scale-100'}`}
                />
                <span className="text-[10px] mt-0.5 leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
