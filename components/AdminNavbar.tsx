'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  UserCheck,
  Calendar,
  Users,
  KeyRound,
  Timer,
  BookOpenCheck,
  Megaphone,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
  BookOpen,
  Award,
  ChevronDown,
  GraduationCap,
  Shield,
  Sliders,
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      window.location.href = '/admin/login';
    }
  };

  const navGroups = [
    {
      id: 'students',
      label: 'Students & Roster',
      icon: Users,
      isActive:
        pathname === '/admin/roster' ||
        pathname === '/admin/verification' ||
        pathname === '/admin/requests',
      items: [
        {
          href: '/admin/roster',
          label: 'Student Directory & CSV Roster',
          desc: 'Cohort-grouped directory with filterable CSV export',
          icon: Users,
        },
        {
          href: '/admin/verification',
          label: 'Verification Queue',
          desc: 'Review and approve self-registered student credentials',
          icon: UserCheck,
        },
        {
          href: '/admin/requests',
          label: 'Biodata Correction Appeals',
          desc: 'Grant 24-hour edit windows for locked registrations',
          icon: KeyRound,
        },
      ],
    },
    {
      id: 'academics',
      label: 'Curriculum & Grades',
      icon: Award,
      isActive:
        pathname === '/admin/courses' ||
        pathname === '/admin/results' ||
        pathname === '/admin/results/release',
      items: [
        {
          href: '/admin/courses',
          label: 'Course Curriculum',
          desc: 'Manage level & semester modules and credit units',
          icon: BookOpen,
        },
        {
          href: '/admin/results',
          label: 'Grade Entry & Processing',
          desc: 'Record CA (30) & Exam (70) scores with dynamic GPA',
          icon: Award,
        },
        {
          href: '/admin/results/release',
          label: 'Automated Release Timers',
          desc: 'Configure level-based scheduled result unlock gates',
          icon: Timer,
        },
      ],
    },
    {
      id: 'governance',
      label: 'Governance & Settings',
      icon: Shield,
      isActive:
        pathname === '/admin/policies' ||
        pathname === '/admin/settings/session' ||
        pathname === '/admin/notifications',
      items: [
        {
          href: '/admin/policies',
          label: 'Academic Policy & Grading Rules',
          desc: 'Manage 5.0 scale, 50% pass mark, and regulations',
          icon: BookOpenCheck,
        },
        {
          href: '/admin/settings/session',
          label: 'Academic Session Progression',
          desc: 'Advance global session and auto-recalculate levels',
          icon: Calendar,
        },
        {
          href: '/admin/notifications',
          label: 'Cohort Broadcasts & Email Alerts',
          desc: 'Publish announcements and trigger batch email notices',
          icon: Megaphone,
        },
      ],
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" ref={navRef}>
      {/* Primary Top Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
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
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                RMS Control Center • Session <span className="font-bold text-teal-800">{activeSession}</span>
              </p>
            </div>
          </Link>
        </div>

        {/* Streamlined Desktop Navigation Links (Max 4 Items) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {/* Item 1: Dashboard */}
          <Link
            href="/admin/dashboard"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === '/admin/dashboard'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin/dashboard' ? 'text-teal-200' : 'text-slate-500'}`} />
            <span>Dashboard</span>
          </Link>

          {/* Items 2, 3, 4: Grouped Dropdowns */}
          {navGroups.map((group) => {
            const Icon = group.icon;
            const isOpen = openDropdown === group.id;
            return (
              <div key={group.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    group.isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${group.isActive ? 'text-teal-800' : 'text-slate-500'}`} />
                  <span>{group.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 space-y-1 z-50 animate-fade-in">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                            isItemActive
                              ? 'bg-teal-800 text-white'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${isItemActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-teal-800'}`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold">{item.label}</p>
                            <p className={`text-[10px] line-clamp-1 ${isItemActive ? 'text-teal-100' : 'text-slate-400'}`}>{item.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
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

      {/* Optional Page Title Header */}
      {pageTitle && (
        <div className="bg-slate-50/60 border-t border-slate-100 py-3 px-4 sm:px-6 lg:px-8">
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
