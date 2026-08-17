'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotificationBell } from './NotificationBell';

interface StudentNavbarProps {
  studentName?: string;
  matricNo?: string;
  currentLevel?: string;
  showBack?: boolean;
}

export function StudentNavbar({
  studentName,
  matricNo,
  currentLevel,
  showBack = false,
}: StudentNavbarProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/student/login';
    }
  };

  const navLinks = [
    { href: '/student/dashboard', label: 'Dashboard' },
    { href: '/student/courses', label: 'Courses' },
    { href: '/student/results', label: 'Results & Transcript' },
    { href: '/student/policies', label: 'Academic Policies' },
    { href: '/student/profile', label: 'Student Profile' },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand & Left Controls */}
          <div className="flex items-center gap-3">
            {showBack && (
              <Link
                href="/student/dashboard"
                className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors mr-1 flex items-center gap-1 text-xs font-bold border border-slate-300"
                title="Back to Student Dashboard"
              >
                <span>&larr;</span>
                <span className="hidden sm:inline">Back</span>
              </Link>
            )}

            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300"
              aria-label="Toggle navigation menu"
              type="button"
            >
              Menu
            </button>

            <Link href="/student/dashboard" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
                className="w-10 h-10 object-contain"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    School of Nursing, UCH
                  </h1>
                  {currentLevel && (
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline">
                      {currentLevel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {studentName ? `${studentName} | ${matricNo || 'Enrolled'}` : 'Undergraduate Nursing Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <NotificationBell />

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-slate-700 text-xs font-bold rounded border border-slate-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Mobile/Tablet Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60">
          <div className="w-72 bg-white h-full border-r border-slate-300 flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="SONUCH Crest" className="w-8 h-8 object-contain" />
                <span className="font-bold text-sm text-slate-900">Student Navigation</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold border border-slate-300"
                type="button"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`block px-3.5 py-2.5 rounded text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-red-50 text-red-700 font-bold text-xs rounded text-center border border-red-200"
                type="button"
              >
                Sign Out
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setDrawerOpen(false)} />
        </div>
      )}
    </>
  );
}

export default StudentNavbar;
