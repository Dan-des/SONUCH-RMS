import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';

import { StudentPortal } from './portals/student/StudentPortal';
import { StudentLogin } from './portals/student/StudentLogin';
import { HomeTab } from './portals/student/tabs/HomeTab';
import { CoursesTab } from './portals/student/tabs/CoursesTab';
import { ResultsTab } from './portals/student/tabs/ResultsTab';
import { ProfileTab } from './portals/student/tabs/ProfileTab';

import { AdminPortal } from './portals/admin/AdminPortal';
import { AdminLogin } from './portals/admin/AdminLogin';
import { AdminHub } from './portals/admin/AdminHub';
import { StudentRoster } from './portals/admin/StudentRoster';
import { ResultProcessing } from './portals/admin/ResultProcessing';
import { NotificationStack } from './components/NotificationStack';

function ProtectedStudentRoute({ children }: { children: JSX.Element }) {
  const { isStudentAuthenticated } = useAppStore();
  const location = useLocation();
  if (!isStudentAuthenticated) {
    return <Navigate to="/student/login" state={{ from: location }} replace />;
  }
  return children;
}

function ProtectedAdminRoute({ children }: { children: JSX.Element }) {
  const { isAdminAuthenticated } = useAppStore();
  const location = useLocation();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}

function resolveThemeClass(theme: 'dark' | 'light' | 'system'): 'theme-light' | '' {
  if (theme === 'light') return 'theme-light';
  if (theme === 'system') {
    try {
      return window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'theme-light'
        : '';
    } catch { return ''; }
  }
  return '';
}

export default function App() {
  const location = useLocation();
  const { theme, initCloudSync, rehydrateAuthSession, isStudentAuthenticated, isAdminAuthenticated } = useAppStore();

  // Dynamic Background PWA Manifest Switcher
  useEffect(() => {
    const manifestLink = document.getElementById('app-manifest-link') as HTMLLinkElement | null;
    if (manifestLink) {
      if (location.pathname.startsWith('/admin')) {
        manifestLink.setAttribute('href', '/manifest-admin.json');
      } else {
        manifestLink.setAttribute('href', '/manifest-student.json');
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    rehydrateAuthSession();
    initCloudSync();
  }, [initCloudSync, rehydrateAuthSession]);

  const [themeClass, setThemeClass] = useState(() => resolveThemeClass(theme));

  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolveThemeClass(theme);
    setThemeClass(resolved);

    if (resolved === 'theme-light') {
      root.classList.add('theme-light', 'light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('theme-light', 'light');
      root.classList.add('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      const root = document.documentElement;
      const resolved = resolveThemeClass('system');
      setThemeClass(resolved);
      if (resolved === 'theme-light') {
        root.classList.add('theme-light', 'light');
        root.classList.remove('dark');
      } else {
        root.classList.remove('theme-light', 'light');
        root.classList.add('dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return (
    <div className={`min-h-dvh font-sans ${themeClass}`} style={{ background: 'var(--uch-bg)', color: 'var(--uch-fg)' }}>
      <Routes>
        {/* Student Routes */}
        <Route
          path="/student/login"
          element={
            isStudentAuthenticated ? (
              <Navigate to="/student/dashboard" replace />
            ) : (
              <StudentLogin />
            )
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <ProtectedStudentRoute>
              <StudentPortal>
                <HomeTab />
              </StudentPortal>
            </ProtectedStudentRoute>
          }
        />
        <Route
          path="/student/courses"
          element={
            <ProtectedStudentRoute>
              <StudentPortal>
                <CoursesTab />
              </StudentPortal>
            </ProtectedStudentRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedStudentRoute>
              <StudentPortal>
                <ResultsTab />
              </StudentPortal>
            </ProtectedStudentRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedStudentRoute>
              <StudentPortal>
                <ProfileTab />
              </StudentPortal>
            </ProtectedStudentRoute>
          }
        />
        <Route
          path="/student"
          element={
            <Navigate
              to={isStudentAuthenticated ? '/student/dashboard' : '/student/login'}
              replace
            />
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            isAdminAuthenticated ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminPortal>
                <AdminHub />
              </AdminPortal>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/roster"
          element={
            <ProtectedAdminRoute>
              <AdminPortal>
                <StudentRoster />
              </AdminPortal>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedAdminRoute>
              <AdminPortal>
                <ResultProcessing />
              </AdminPortal>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedAdminRoute>
              <AdminPortal>
                <ResultProcessing />
              </AdminPortal>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedAdminRoute>
              <AdminPortal>
                <AdminHub />
              </AdminPortal>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <Navigate
              to={isAdminAuthenticated ? '/admin/dashboard' : '/admin/login'}
              replace
            />
          }
        />

        {/* Fallback Root Redirect */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAdminAuthenticated
                  ? '/admin/dashboard'
                  : isStudentAuthenticated
                  ? '/student/dashboard'
                  : '/student/login'
              }
              replace
            />
          }
        />
      </Routes>
      <NotificationStack />
    </div>
  );
}
