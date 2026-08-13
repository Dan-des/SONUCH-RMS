'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  BookOpen,
  FileText,
  CheckCircle2,
  Award,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { StudentNavbar } from '../../../components/StudentNavbar';

export default function StudentDashboardPage() {
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
          window.location.href = '/student/pending';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
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
      {/* Student Light Navbar */}
      <StudentNavbar studentName={student?.fullName} matricNo={student?.matricNo} />

      {/* Main Student Hub Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Student Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 overflow-hidden flex items-center justify-center font-black text-xl text-teal-800 shadow-xs">
              {student?.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                student?.fullName ? student.fullName.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{student?.fullName}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded-full uppercase">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Matriculation No: <span className="font-mono font-bold text-teal-800">{student?.matricNo}</span> • Admission Year: {student?.admissionYear}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                Current Level
              </p>
              <p className="text-lg font-black text-teal-800 mt-0.5">{student?.currentLevel || '100L'}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Cumulative GPA
              </p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{gpa} / 5.00</p>
            </div>
          </div>
        </div>

        {/* Quick Access to Academic Policies Notice */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-300" />
              <span>Official Academic Regulations & Pass Mark Policy</span>
            </h3>
            <p className="text-xs text-teal-100 font-medium">
              Review pass mark thresholds (50% minimum), probation rules, clinical posting guidelines, and exam criteria.
            </p>
          </div>
          <Link
            href="/student/policies"
            className="px-4 py-2.5 bg-white text-teal-900 text-xs font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-xs whitespace-nowrap flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <span>Read Policy Handbook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grade Results Table / Release Lock State */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Academic Grades & Examination Records</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Session {student?.activeSession || '2026/2027'} • Official Nursing School Results
              </p>
            </div>

            {isLocked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-full">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Result Release Pending Countdown</span>
              </span>
            )}
          </div>

          {isLocked ? (
            <div className="py-12 text-center space-y-3 bg-amber-50/50 border border-dashed border-amber-200 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl mx-auto">
                <Lock className="w-6 h-6 text-amber-800" />
              </div>
              <h4 className="text-sm font-extrabold text-amber-900">Results Under Automated Release Lock</h4>
              <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed font-medium">
                Official grades for {student?.currentLevel} are scheduled for automated release by the Academic Board. Your results will unlock automatically once the release timer expires.
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No examination grades recorded yet for {student?.currentLevel || 'current session'}.</p>
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
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.code}</td>
                      <td className="py-3.5 px-4 font-semibold">{item.title}</td>
                      <td className="py-3.5 px-4 font-bold">{item.units}</td>
                      <td className="py-3.5 px-4 font-bold">{item.score}</td>
                      <td className="py-3.5 px-4 font-extrabold text-teal-800">{item.grade}</td>
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
