'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LogOut,
  ArrowLeft,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface StudentNavbarProps {
  studentName?: string;
  matricNo?: string;
  showBack?: boolean;
}

export function StudentNavbar({
  studentName,
  matricNo,
  showBack = false,
}: StudentNavbarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/student/login';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Shield & Student Info */}
        <div className="flex items-center gap-3.5">
          {showBack && (
            <Link
              href="/student/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors mr-1 flex items-center gap-1 text-xs font-bold shadow-xs"
              title="Back to Student Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-teal-800" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          )}

          <Link href="/student/dashboard" className="flex items-center gap-3 group">
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
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {studentName ? `${studentName} • ${matricNo || 'Enrolled'}` : 'Undergraduate Nursing Portal'}
              </p>
            </div>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          <Link
            href="/student/policies"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors hidden sm:inline-flex items-center gap-1.5 shadow-xs ${
              pathname === '/student/policies'
                ? 'bg-teal-800 border-teal-800 text-white'
                : 'bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Policies</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default StudentNavbar;
