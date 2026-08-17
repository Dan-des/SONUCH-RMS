'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminNavbarProps {
  activeSession?: string;
  pageTitle?: string;
  pageSubtitle?: string;
  showBack?: boolean;
}

export function AdminNavbar({
  activeSession = '2026/2027',
  pageTitle,
  pageSubtitle,
  showBack = false,
}: AdminNavbarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/admin/login';
    }
  };

  const navLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/roster', label: 'Student Roster' },
    { href: '/admin/courses', label: 'Courses' },
    { href: '/admin/results', label: 'Results & Grades' },
    { href: '/admin/policies', label: 'Grading Policy' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Primary Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Crest */}
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href="/admin/dashboard"
              className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors mr-1 flex items-center gap-1 text-xs font-bold border border-slate-300"
              title="Back to Admin Dashboard"
            >
              <span>&larr;</span>
              <span className="hidden sm:inline">Back</span>
            </Link>
          )}

          <Link href="/admin/dashboard" className="flex items-center gap-3">
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
                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider hidden md:inline">
                  Admin RMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Results Management System | Session <span className="font-bold text-emerald-800">{activeSession}</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Simplified Direct Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
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

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Session: {activeSession}</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-slate-700 text-xs font-bold rounded border border-slate-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Optional Page Title Sub-Header */}
      {pageTitle && (
        <div className="bg-slate-50 border-t border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{pageTitle}</h2>
              {pageSubtitle && <p className="text-[11px] text-slate-500 mt-0.5">{pageSubtitle}</p>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AdminNavbar;
