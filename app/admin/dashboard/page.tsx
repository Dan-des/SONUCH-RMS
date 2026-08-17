'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { CardSkeletonLoader } from '../../../components/SkeletonLoader';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [systemKeyData, setSystemKeyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rotatingKey, setRotatingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyMessage, setKeyMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    fetchSystemKey();
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

  const fetchSystemKey = async () => {
    try {
      const res = await fetch('/api/admin/system-key');
      const data = await res.json();
      if (res.ok) {
        setSystemKeyData(data);
      }
    } catch (err) {
      console.error('Failed to load system key data:', err);
    }
  };

  const handleRotateKey = async () => {
    if (
      !confirm(
        'Are you sure you want to generate a new Master Admin Access UUID Key? The new key will be emailed to ' +
          (systemKeyData?.superAdminEmail || 'the Super Admin') +
          ' immediately.'
      )
    ) {
      return;
    }

    setRotatingKey(true);
    setKeyMessage(null);

    try {
      const res = await fetch('/api/admin/system-key', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to rotate access key');
      }

      setKeyMessage(`Success! New Master Key: ${data.newAccessKey} (dispatched to ${data.superAdminEmail})`);
      fetchSystemKey();
    } catch (err: any) {
      setKeyMessage(`Error: ${err.message}`);
    } finally {
      setRotatingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (systemKeyData?.activeKey) {
      navigator.clipboard.writeText(systemKeyData.activeKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar activeSession={stats?.activeSession || '2026/2027'} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Institutional Control Center
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Academic Administration Overview
            </h1>
            <p className="text-xs text-slate-600 max-w-xl">
              School of Nursing, University College Hospital, Ibadan. Record examination marks, verify student registrations, and manage NMCN grading scales.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-3 self-start md:self-auto text-xs text-slate-700 space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Session</p>
            <p className="text-sm font-bold text-emerald-900">{loading ? 'Loading…' : stats?.activeSession || '2026/2027'}</p>
          </div>
        </div>

        {/* 4 Essential KPI Stats */}
        {loading ? (
          <CardSkeletonLoader count={4} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/results"
              className="bg-white p-5 rounded-lg border border-slate-200 hover:border-emerald-700 transition-colors block space-y-2"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Results Uploaded</span>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalGrades || 0}</p>
              <p className="text-xs text-emerald-800 font-semibold">Recorded Grades &rarr;</p>
            </Link>

            <Link
              href="/admin/courses"
              className="bg-white p-5 rounded-lg border border-slate-200 hover:border-emerald-700 transition-colors block space-y-2"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Curriculum Courses</span>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalCourses || 0}</p>
              <p className="text-xs text-slate-600 font-semibold">Active Modules &rarr;</p>
            </Link>

            <Link
              href="/admin/roster"
              className="bg-white p-5 rounded-lg border border-slate-200 hover:border-emerald-700 transition-colors block space-y-2"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Students</span>
              <p className="text-2xl font-bold text-slate-900">{stats?.totalStudents || 0}</p>
              <p className="text-xs text-slate-600 font-semibold">Enrolled Roster &rarr;</p>
            </Link>

            <Link
              href="/admin/verification"
              className="bg-white p-5 rounded-lg border border-slate-200 hover:border-amber-600 transition-colors block space-y-2"
            >
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Approval</span>
              <p className="text-2xl font-bold text-amber-900">{stats?.pendingVerifications || 0}</p>
              <p className="text-xs text-amber-800 font-semibold">
                {stats?.pendingVerifications > 0 ? 'Verification Needed &rarr;' : 'All Students Verified'}
              </p>
            </Link>
          </div>
        )}

        {/* Master Admin Access Key Governance Card */}
        {systemKeyData && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Master Admin Access Key Governance
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin Email: <span className="font-semibold text-emerald-900">{systemKeyData.superAdminEmail}</span>
                </p>
              </div>

              {systemKeyData.isSuperAdmin ? (
                <button
                  onClick={handleRotateKey}
                  disabled={rotatingKey}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded border border-slate-300 transition-colors self-start sm:self-auto disabled:opacity-50"
                  type="button"
                >
                  {rotatingKey ? 'Generating & Dispatching…' : 'Rotate Access UUID Key'}
                </button>
              ) : (
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold rounded">
                  Governance Locked by Super Admin
                </span>
              )}
            </div>

            {keyMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-semibold text-emerald-900">
                {keyMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Active Master Access Code
                </span>
                <code className="text-xs font-mono font-bold text-slate-900 mt-0.5 block">
                  {systemKeyData.activeKey}
                </code>
              </div>

              {systemKeyData.isSuperAdmin && (
                <button
                  onClick={handleCopyKey}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 transition-colors self-start sm:self-auto"
                  type="button"
                >
                  {copiedKey ? 'Key Copied' : 'Copy Key'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2 Focused Core Result Management Workflows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Results & Grade Entry */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Grade Recording & Result Processing</h2>
                <p className="text-xs text-slate-500">Record CA (30) and Examination (70) scores per student.</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Input semester course grades, calculate quality points and GPAs following NMCN 5.00 standards, and manage published grade records.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Assessment Model</span>
                  <p className="font-semibold text-slate-900 mt-0.5">CA (30) + Exam (70)</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Minimum Pass Standard</span>
                  <p className="font-semibold text-emerald-900 mt-0.5">50% Minimum Pass (C)</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <Link
                href="/admin/results"
                className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded text-center transition-colors"
              >
                Enter / Record Grades
              </Link>
              <Link
                href="/admin/courses"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 text-center transition-colors"
              >
                Manage Courses
              </Link>
            </div>
          </div>

          {/* Card 2: Student Registry & Governance */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <h2 className="text-base font-bold text-slate-900">Student Directory & Verification</h2>
                <p className="text-xs text-slate-500">Manage admissions roster, verify accounts, and download reports.</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Filter students across 100L–400L cohorts, approve pending self-registrations, and manage institutional policy guidelines.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Roster</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{stats?.totalStudents || 0} Students</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Pending Verification</span>
                  <p className="font-semibold text-amber-900 mt-0.5">{stats?.pendingVerifications || 0} Accounts</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <Link
                href="/admin/roster"
                className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded text-center transition-colors"
              >
                View Student Roster
              </Link>
              <Link
                href="/admin/verification"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 text-center transition-colors"
              >
                Verification Queue ({stats?.pendingVerifications || 0})
              </Link>
              <Link
                href="/admin/policies"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded border border-slate-300 text-center transition-colors"
              >
                Grading Policy
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
