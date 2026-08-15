'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Award,
  UserCheck,
  BookOpenCheck,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers,
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Streamlined Clean Navbar */}
      <AdminNavbar activeSession={stats?.activeSession || '2026/2027'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-xs font-bold text-teal-900">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Results Management System (RMS)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Administrator Overview
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              School of Nursing, University College Hospital, Ibadan. Record examination grades, manage student rosters, and view curriculum results.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3 self-start md:self-auto">
            <div className="p-2.5 bg-teal-800 text-white rounded-xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Current Term</p>
              <p className="text-base font-black text-slate-900">{loading ? '…' : stats?.activeSession || '2026/2027'}</p>
            </div>
          </div>
        </div>

        {/* 4 Essential KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/results"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Results Uploaded</span>
              <div className="p-2 bg-teal-50 text-teal-800 rounded-xl group-hover:bg-teal-800 group-hover:text-white transition-colors">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{loading ? '…' : stats?.totalGrades || 0}</p>
            <p className="text-[11px] text-teal-800 font-bold mt-1">Recorded Grades</p>
          </Link>

          <Link
            href="/admin/courses"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Curriculum Courses</span>
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{loading ? '…' : stats?.totalCourses || 0}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Active Modules</p>
          </Link>

          <Link
            href="/admin/roster"
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Students</span>
              <div className="p-2 bg-slate-100 text-slate-700 rounded-xl group-hover:bg-teal-800 group-hover:text-white transition-colors">
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
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Approval</span>
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-800 mt-2">{loading ? '…' : stats?.pendingVerifications || 0}</p>
            <p className="text-[11px] text-amber-700 font-bold mt-1">
              {stats?.pendingVerifications > 0 ? 'Verification Needed' : 'All Students Verified'}
            </p>
          </Link>
        </div>

        {/* 2 Focused Core Result Management Workflows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Results & Grade Entry */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-800 border border-teal-200 rounded-2xl">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Grade Recording & Processing</h2>
                  <p className="text-xs text-slate-500 font-medium">Record continuous assessment (CA 30) and exam (70) marks.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Enter student semester grades, compute GP and GPA automatically using the official 5.0 scale, and publish transcripts.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assessment</span>
                  <p className="font-bold text-slate-800 mt-0.5">CA (30) + Exam (70)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Grading Standard</span>
                  <p className="font-bold text-teal-800 mt-0.5">50% Minimum Pass (C)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/admin/results"
                className="flex-1 py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Enter / Record Grades</span>
              </Link>

              <Link
                href="/admin/courses"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-teal-800" />
                <span>Manage Courses</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Student Registry & Governance */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Student Directory & Registry</h2>
                  <p className="text-xs text-slate-500 font-medium">Manage student roster, verify accounts, and download CSV reports.</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Browse students by cohort level (100L–400L), approve pending accounts, and export full student demographic data to CSV.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Roster</span>
                  <p className="font-bold text-slate-800 mt-0.5">{stats?.totalStudents || 0} Registered</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Verification Queue</span>
                  <p className="font-bold text-amber-800 mt-0.5">{stats?.pendingVerifications || 0} Pending</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/admin/roster"
                className="flex-1 py-3 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>View Student Roster</span>
              </Link>

              <Link
                href="/admin/verification"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4 text-amber-700" />
                <span>Verification ({stats?.pendingVerifications || 0})</span>
              </Link>

              <Link
                href="/admin/policies"
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpenCheck className="w-4 h-4 text-teal-800" />
                <span>Grading Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
