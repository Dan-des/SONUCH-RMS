'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Calendar,
  Users,
  KeyRound,
  Timer,
  BookOpenCheck,
  Megaphone,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (res.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const studentModules = [
    {
      title: 'Student Verification Queue',
      desc: 'Review self-registered nursing students, approve single or bulk verifications, and trigger automated welcome emails.',
      href: '/admin/verification',
      badge: stats?.pendingVerifications > 0 ? `${stats.pendingVerifications} Pending` : 'All Verified',
      badgeColor: stats?.pendingVerifications > 0 ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Student Directory & Roster',
      desc: 'Browse cohort-grouped student rosters, search student profiles, and stream customized CSV spreadsheets.',
      href: '/admin/roster',
      badge: `${stats?.totalStudents || 0} Registered`,
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: Users,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Correction & Unlock Requests',
      desc: 'Review student appeals to modify locked biodata and grant temporary 24-hour editing windows.',
      href: '/admin/requests',
      badge: stats?.pendingRequests > 0 ? `${stats.pendingRequests} Needs Action` : '0 Pending',
      badgeColor: stats?.pendingRequests > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-700 border-slate-200',
      icon: KeyRound,
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  const academicModules = [
    {
      title: 'Academic Session Progression',
      desc: 'Manage institution-wide academic session years (e.g. 2026/2027) and dynamically recalculate student level progressions.',
      href: '/admin/settings/session',
      badge: stats?.activeSession || '2026/2027',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      icon: Calendar,
      iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Result Release Countdowns',
      desc: 'Configure level-based automated result release timers with automated server unlocking.',
      href: '/admin/results/release',
      badge: 'Release Manager',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: Timer,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Academic Policy CMS',
      desc: 'Publish, edit, and manage institutional regulations, pass mark requirements (50% Grade C), and probation rules.',
      href: '/admin/policies',
      badge: `${stats?.publishedPolicies || 0} Published`,
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      icon: BookOpenCheck,
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200',
    },
    {
      title: 'Targeted Announcements',
      desc: 'Publish campus broadcast announcements and dispatch transactional batch email alerts to specific student cohorts.',
      href: '/admin/notifications',
      badge: 'Broadcasts',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: Megaphone,
      iconBg: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Light Navbar */}
      <AdminNavbar activeSession={stats?.activeSession || '2026/2027'} />

      {/* Main Content Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-teal-900">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Official Academic Administration Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              School of Nursing, University College Hospital, Ibadan. Manage student admissions, dynamic level promotion, examination releases, and academic policies.
            </p>
          </div>

          {/* Quick Active Session Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 flex-shrink-0">
            <div className="p-3 bg-teal-800 text-white rounded-xl shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Session</p>
              <p className="text-lg font-black text-slate-900">{loading ? '…' : stats?.activeSession || '2026/2027'}</p>
            </div>
          </div>
        </div>

        {/* Live KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/roster"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-600 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-teal-50 group-hover:text-teal-800 transition-colors">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{loading ? '…' : stats?.totalStudents || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Enrolled Nursing Students</p>
          </Link>

          <Link
            href="/admin/verification"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-amber-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Pending Verification</span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-100 transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-700 mt-2">{loading ? '…' : stats?.pendingVerifications || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Awaiting Admin Approval</p>
          </Link>

          <Link
            href="/admin/requests"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-rose-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Unlock Requests</span>
              <div className="p-2 bg-rose-50 text-rose-700 rounded-xl group-hover:bg-rose-100 transition-colors">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-700 mt-2">{loading ? '…' : stats?.pendingRequests || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Biodata Correction Appeals</p>
          </Link>

          <Link
            href="/admin/policies"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-600 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">Academic Policies</span>
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl group-hover:bg-teal-100 transition-colors">
                <BookOpenCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-teal-800 mt-2">{loading ? '…' : stats?.publishedPolicies || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Official Regulations Active</p>
          </Link>
        </div>

        {/* Section 1: Student Registry & Verification */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Student Registry & Admissions</h2>
              <p className="text-xs text-slate-500 font-medium">Verify credentials, manage student rosters, and process biodata corrections.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {studentModules.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-teal-700 rounded-3xl p-6 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${item.iconBg}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-xs font-bold text-teal-800 group-hover:translate-x-1 transition-transform gap-1">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Academic Engine & Policy */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Academic Engine & Governance</h2>
              <p className="text-xs text-slate-500 font-medium">Manage academic sessions, automated countdown timers, institutional policies, and cohort broadcasts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {academicModules.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-teal-700 rounded-3xl p-6 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${item.iconBg}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`px-2.5 py-0.5 border text-[10px] font-extrabold rounded-full ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-800 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-xs font-bold text-teal-800 group-hover:translate-x-1 transition-transform gap-1">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
