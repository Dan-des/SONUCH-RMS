'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NotificationBell } from '../../../components/NotificationBell';

export default function StudentDashboardPage() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any>(null);
  const [releaseStatus, setReleaseStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, gradesRes, releaseRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/student/grades'),
        fetch('/api/student/result-release'),
      ]);

      const profile = await profileRes.json();
      if (profileRes.ok && profile.student) {
        if (profile.student.status === 'pending_verification') {
          router.push('/pending');
          return;
        }
        setStudent(profile.student);
      }

      if (gradesRes.ok) {
        const grades = await gradesRes.json();
        setGradesData(grades);
      }

      if (releaseRes.ok) {
        const release = await releaseRes.json();
        setReleaseStatus(release);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/student/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading student portal…</p>
        </div>
      </div>
    );
  }

  const grades = gradesData?.grades || [];
  const gpa = gradesData?.gpa || '0.00';
  const isLocked = releaseStatus?.isLocked;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Student Sticky Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-800 text-white font-black flex items-center justify-center text-sm shadow-sm">
            UCH
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800">SONUCH RMS Portal</h1>
            <p className="text-[11px] text-slate-500 font-semibold">
              {student?.fullName} ({student?.matricNo})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <Link
            href="/student/policies"
            className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200 transition-colors hidden sm:inline-block"
          >
            Academic Policies
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </header>

      {/* Main Student Hub Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Student Profile Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-teal-500/30 overflow-hidden flex items-center justify-center font-black text-xl text-teal-800">
              {student?.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                student?.fullName ? student.fullName.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-800">{student?.fullName}</h2>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Matriculation No: <span className="font-mono font-bold text-slate-700">{student?.matricNo}</span> • Admission Year: {student?.admissionYear}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Level</p>
              <p className="text-base font-black text-teal-800">{student?.currentLevel || '100L'}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cumulative GPA</p>
              <p className="text-base font-black text-slate-900">{gpa} / 5.00</p>
            </div>
          </div>
        </div>

        {/* Quick Access to Academic Policies Notice */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold">Institutional Regulations & Pass Mark Policy</h3>
            <p className="text-xs text-teal-100">
              Review pass marks, probation rules, ward clinical regulations, and examination guidelines.
            </p>
          </div>
          <Link
            href="/student/policies"
            className="px-4 py-2 bg-white text-teal-900 text-xs font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-sm whitespace-nowrap"
          >
            Read Policies &rarr;
          </Link>
        </div>

        {/* Grade Results Table / Release Lock State */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-800">Academic Grades & Transcripts</h3>
              <p className="text-xs text-slate-500 font-semibold">
                Session {student?.activeSession || '2026/2027'} • Official Nursing Examination Records
              </p>
            </div>

            {isLocked && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-full">
                🔒 Result Release Pending Timer
              </span>
            )}
          </div>

          {isLocked ? (
            <div className="py-12 text-center space-y-3 bg-amber-50/50 border border-dashed border-amber-200 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl mx-auto">
                🔒
              </div>
              <h4 className="text-sm font-extrabold text-amber-900">Results Under Automated Release Lock</h4>
              <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                Official grades for {student?.currentLevel} are scheduled for automated release by the Academic Board. Your results will unlock automatically once the release timer expires.
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No registered course grades found for the active academic session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-extrabold uppercase text-[10px]">
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Credit Units</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {grades.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.code}</td>
                      <td className="py-3 px-4 font-semibold">{item.title}</td>
                      <td className="py-3 px-4 font-bold">{item.units}</td>
                      <td className="py-3 px-4 font-bold">{item.score}</td>
                      <td className="py-3 px-4 font-extrabold text-teal-800">{item.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
