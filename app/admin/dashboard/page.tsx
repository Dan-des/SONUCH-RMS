'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/admin/login');
    }
  };

  const navItems = [
    {
      title: 'Student Verification Queue',
      desc: 'Review self-registered nursing students, approve single or bulk verifications, and trigger welcome emails.',
      href: '/admin/verification',
      badge: 'Action Required',
      color: 'bg-emerald-500',
    },
    {
      title: 'Academic Session Progression',
      desc: 'Manage global session years (e.g. 2026/2027) and calculate dynamic level progressions.',
      href: '/admin/settings/session',
      badge: 'Core Engine',
      color: 'bg-indigo-500',
    },
    {
      title: 'Student Roster & CSV Stream',
      desc: 'Browse level-grouped student rosters, manage GPA records, and export streamed CSV/XLSX reports.',
      href: '/admin/roster',
      badge: 'Data Export',
      color: 'bg-blue-500',
    },
    {
      title: 'Correction & Unlock Requests',
      desc: 'Process 24-hour student registration correction requests and grant temporary editing windows.',
      href: '/admin/requests',
      badge: 'Permissions',
      color: 'bg-amber-500',
    },
    {
      title: 'Result Release Countdowns',
      desc: 'Configure level-based automated result release timers with dynamic auto-unlocking.',
      href: '/admin/results/release',
      badge: 'Auto-Release',
      color: 'bg-purple-500',
    },
    {
      title: 'Academic Policy CMS',
      desc: 'Publish, edit, and archive institutional regulations, pass mark guidelines, and probation policies.',
      href: '/admin/policies',
      badge: 'Handbook',
      color: 'bg-teal-500',
    },
    {
      title: 'Targeted Announcements Dispatcher',
      desc: 'Broadcast targeted notifications and Brevo batch email alerts to specific student cohorts.',
      href: '/admin/notifications',
      badge: 'Broadcasts',
      color: 'bg-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Admin Sticky Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 font-black text-white flex items-center justify-center text-base shadow-md">
            UCH
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white">SONUCH RMS Admin Hub</h1>
            <p className="text-xs text-slate-400 font-medium">
              School of Nursing, University College Hospital • Executive Portal
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white">Executive Control Center</h2>
          <p className="text-xs text-slate-400 font-semibold">
            Select an administrative module below to manage academic sessions, verifications, grades, and policies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-slate-800 hover:bg-slate-800/80 border border-slate-700 hover:border-teal-500/50 rounded-3xl p-6 transition-all duration-200 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="px-2.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-base font-black text-white group-hover:text-teal-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
                Open Module &rarr;
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
