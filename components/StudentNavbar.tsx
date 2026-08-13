'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LogOut,
  ArrowLeft,
  User,
  LayoutDashboard,
  Award,
  FileText,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';
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
    { href: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Courses', icon: BookOpen },
    { href: '/student/results', label: 'Results', icon: Award },
    { href: '/student/policies', label: 'Policies', icon: FileText },
    { href: '/student/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Brand & Left Controls */}
          <div className="flex items-center gap-3">
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

            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-xs"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-teal-800" />
            </button>

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
                  {currentLevel && (
                    <span className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-black rounded-full uppercase tracking-wider hidden sm:inline">
                      {currentLevel}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {studentName ? `${studentName} • ${matricNo || 'Enrolled'}` : 'Undergraduate Nursing Portal'}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
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
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <NotificationBell />

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

      {/* Slide-over Mobile/Tablet Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <img src="/logo.png" alt="SONUCH" className="w-8 h-8 object-contain" />
                <span className="font-black text-sm text-slate-900">Student Menu</span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-teal-800 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
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
