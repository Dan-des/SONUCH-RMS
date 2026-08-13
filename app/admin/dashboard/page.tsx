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
  BookOpen,
  Award,
  Shield,
  ChevronRight,
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

  const hubCategories = [
    {
      id: 'students',
      title: 'Student Registry & Admissions',
      desc: 'Verify newly self-registered nursing students, manage cohort directories, and process registration unlock appeals.',
      icon: Users,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
      badge: `${stats?.totalStudents || 0} Registered`,
      links: [
        {
          href: '/admin/roster',
          title: 'Student Directory & Roster',
          desc: 'Search student profiles and export level-filtered CSV rosters.',
          icon: Users,
          count: `${stats?.totalStudents || 0} Enrolled`,
        },
        {
          href: '/admin/verification',
          title: 'Verification Queue',
          desc: 'Review credentials and approve student access.',
          icon: UserCheck,
          count: stats?.pendingVerifications > 0 ? `${stats.pendingVerifications} Pending` : 'Clean Queue',
          alert: stats?.pendingVerifications > 0,
        },
        {
          href: '/admin/requests',
          title: 'Biodata Unlock Appeals',
          desc: 'Grant 24-hour correction windows for locked student fields.',
          icon: KeyRound,
          count: stats?.pendingRequests > 0 ? `${stats.pendingRequests} Appeals` : '0 Pending',
          alert: stats?.pendingRequests > 0,
        },
      ],
    },
    {
      id: 'academics',
      title: 'Curriculum & Grade Engine',
      desc: 'Register nursing courses per semester, enter continuous assessments & exam marks, and configure release countdown timers.',
      icon: Award,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      badge: 'Academic Module',
      links: [
        {
          href: '/admin/courses',
          title: 'Course Curriculum',
          desc: 'Register course codes, titles, and credit units per level.',
          icon: BookOpen,
          count: 'Curriculum',
        },
        {
          href: '/admin/results',
          title: 'Grade Entry & Calculation',
          desc: 'Record CA (30) + Exam (70) scores with dynamic GPA.',
          icon: Award,
          count: 'Grade Entry',
        },
        {
          href: '/admin/results/release',
          title: 'Automated Release Timers',
          desc: 'Configure level-based scheduled result release locks.',
          icon: Timer,
          count: 'Countdowns',
        },
      ],
    },
    {
      id: 'governance',
      title: 'Governance & Operations',
      desc: 'Govern NMCN grading policy scales, advance global academic sessions, and dispatch targeted broadcast alerts to student cohorts.',
      icon: Shield,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      badge: 'System Governance',
      links: [
        {
          href: '/admin/policies',
          title: 'Academic Policy & Rules',
          desc: 'Manage 5.0 scale, 50% pass mark, and published regulations.',
          icon: BookOpenCheck,
          count: `${stats?.publishedPolicies || 0} Policies`,
        },
        {
          href: '/admin/settings/session',
          title: 'Session Progression',
          desc: 'Advance global session and auto-recalculate student levels.',
          icon: Calendar,
          count: stats?.activeSession || '2026/2027',
        },
        {
          href: '/admin/notifications',
          title: 'Cohort Broadcasts',
          desc: 'Publish campus announcements & dispatch batch emails.',
          icon: Megaphone,
          count: 'Announcements',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Streamlined Navbar */}
      <AdminNavbar activeSession={stats?.activeSession || '2026/2027'} />

      {/* Main Content Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Executive Header */}
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
              School of Nursing, University College Hospital, Ibadan. Oversee admissions, curriculum, dynamic grading rules, and academic sessions.
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

        {/* Live KPI Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/roster"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-600 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Enrolled</span>
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
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Verification</span>
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
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Unlock Appeals</span>
              <div className="p-2 bg-rose-50 text-rose-700 rounded-xl group-hover:bg-rose-100 transition-colors">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-700 mt-2">{loading ? '…' : stats?.pendingRequests || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Biodata Correction Requests</p>
          </Link>

          <Link
            href="/admin/policies"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-600 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Academic Policies</span>
              <div className="p-2 bg-teal-50 text-teal-700 rounded-xl group-hover:bg-teal-100 transition-colors">
                <BookOpenCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-teal-800 mt-2">{loading ? '…' : stats?.publishedPolicies || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Grading & Conduct Rules</p>
          </Link>
        </div>

        {/* 3 Decluttered Unified Operational Hubs */}
        <div className="space-y-6">
          {hubCategories.map((hub) => {
            const HubIcon = hub.icon;
            return (
              <div
                key={hub.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border ${hub.color}`}>
                      <HubIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                        {hub.title}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{hub.desc}</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-full">
                    {hub.badge}
                  </span>
                </div>

                {/* Sub Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {hub.links.map((link) => {
                    const LinkIcon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-teal-700 rounded-2xl p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="p-2 bg-white rounded-xl text-teal-800 border border-slate-200 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                              <LinkIcon className="w-4 h-4" />
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                link.alert
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-white text-slate-600 border border-slate-200'
                              }`}
                            >
                              {link.count}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                            {link.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {link.desc}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center text-xs font-bold text-teal-800 group-hover:translate-x-1 transition-transform gap-1">
                          <span>Access Module</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
