'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  BookOpen,
  Award,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  BookOpenCheck,
} from 'lucide-react';

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
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/roster', label: 'Student Roster', icon: Users },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/results', label: 'Results & Grades', icon: Award },
    { href: '/admin/policies', label: 'Grading Policy', icon: BookOpenCheck },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Primary Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Crest */}
        <div className="flex items-center gap-3.5">
          {showBack && (
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors mr-1 flex items-center gap-1 text-xs font-bold shadow-xs"
              title="Back to Admin Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-teal-800" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          )}

          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="School of Nursing UCH Shield"
              className="w-10 h-10 object-contain drop-shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight group-hover:text-teal-800 transition-colors">
                  School of Nursing, UCH
                </h1>
                <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-black rounded-full uppercase tracking-wider hidden md:inline">
                  Admin RMS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Results Management System • Session <span className="font-bold text-teal-800">{activeSession}</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Simplified Direct Desktop Navigation Links (Only 5 Direct Tabs) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Session: {activeSession}</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Optional Page Title Sub-Header */}
      {pageTitle && (
        <div className="bg-slate-50/70 border-t border-slate-100 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">{pageTitle}</h2>
              {pageSubtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{pageSubtitle}</p>}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default AdminNavbar;
