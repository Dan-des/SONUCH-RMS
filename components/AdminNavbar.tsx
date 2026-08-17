'use client';

import React, { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/admin/login';
    }
  };

  const primaryNavLinks = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/roster', label: 'Student Roster' },
    { href: '/admin/courses', label: 'Courses' },
    { href: '/admin/results', label: 'Results & Grades' },
    { href: '/admin/policies', label: 'Policies' },
  ];

  const secondaryNavLinks = [
    { href: '/admin/verification', label: 'Admissions Verification' },
    { href: '/admin/results/release', label: 'Result Release Lock' },
    { href: '/admin/requests', label: 'Unlock Appeals' },
    { href: '/admin/notifications', label: 'Cohort Broadcasts' },
    { href: '/admin/settings/session', label: 'Session Manager' },
  ];

  return (
    <>
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

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors focus:outline-none"
              aria-label="Toggle admin navigation menu"
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2.5 sm:gap-3">
              <img
                src="/logo.png"
                alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight">
                    School of Nursing, UCH
                  </h1>
                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider hidden sm:inline">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                  RMS | Session <span className="font-bold text-emerald-800">{activeSession}</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {primaryNavLinks.map((link) => {
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
              className="px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-slate-700 text-xs font-bold rounded border border-slate-200 transition-colors"
              type="button"
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

      {/* Mobile Drawer / Slide-Over Menu for Admin */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 animate-fade-in">
          <div className="w-72 bg-white h-full border-r border-slate-300 flex flex-col p-5 space-y-5 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="SONUCH Crest"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Admin Navigation</h3>
                  <p className="text-[10px] text-slate-500">Session {activeSession}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold border border-slate-300"
                type="button"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Primary Navigation Section */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Main Academic Management
              </p>
              {primaryNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Secondary / Admin Controls Section */}
            <div className="space-y-1 border-t border-slate-200 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                Administrative Operations
              </p>
              {secondaryNavLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-800 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="border-t border-slate-200 pt-4 mt-auto space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded text-center border border-red-200 transition-colors"
                type="button"
              >
                Sign Out Administrator
              </button>
            </div>
          </div>

          {/* Click-outside backdrop */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
}

export default AdminNavbar;
