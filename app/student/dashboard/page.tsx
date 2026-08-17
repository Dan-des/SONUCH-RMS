'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';
import { TableSkeletonLoader, CardSkeletonLoader } from '../../../components/SkeletonLoader';

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any>(null);
  const [releaseStatus, setReleaseStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedMatric, setCopiedMatric] = useState(false);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

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

  // Countdown timer tick effect
  useEffect(() => {
    if (!releaseStatus?.releaseDate) {
      setTimeLeft(null);
      return;
    }

    const target = new Date(releaseStatus.releaseDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [releaseStatus]);

  const handleCopyMatric = () => {
    if (student?.matricNo) {
      navigator.clipboard.writeText(student.matricNo);
      setCopiedMatric(true);
      setTimeout(() => setCopiedMatric(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <StudentNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <CardSkeletonLoader count={4} />
          <TableSkeletonLoader rows={5} cols={6} />
        </main>
        <InstitutionalFooter />
      </div>
    );
  }

  const grades = gradesData?.grades || [];
  const cgpaNumber = Number(gradesData?.cgpa || 0);
  const cgpa = cgpaNumber.toFixed(2);
  const totalCreditUnits = gradesData?.totalCreditUnits || 0;
  const isLocked = releaseStatus?.isLocked;
  const isProfileIncomplete = !student?.phone || !student?.stateOfOrigin || !student?.dateOfBirth;

  // Degree / Academic Classification
  let standingTitle = 'Good Standing';
  let standingClass = 'Distinction';
  if (cgpaNumber >= 4.5) {
    standingClass = 'Distinction (4.50 - 5.00)';
  } else if (cgpaNumber >= 3.5) {
    standingClass = 'Upper Credit (3.50 - 4.49)';
  } else if (cgpaNumber >= 2.5) {
    standingClass = 'Lower Credit (2.50 - 3.49)';
  } else if (cgpaNumber >= 2.0) {
    standingClass = 'Pass (2.00 - 2.49)';
  } else if (cgpaNumber > 0) {
    standingClass = 'Probation Review (< 2.00)';
    standingTitle = 'Academic Review Required';
  } else {
    standingClass = 'Fresh Enrolment';
  }

  const cgpaPercentage = Math.min(100, Math.max(0, (cgpaNumber / 5.0) * 100));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0 text-slate-900">
      <StudentNavbar
        studentName={student?.fullName}
        matricNo={student?.matricNo}
        currentLevel={student?.currentLevel}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Profile Incomplete Warning Banner */}
        {isProfileIncomplete && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Student Demographic Profile Incomplete
              </h2>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your official student profile requires contact information and State of Origin for indexing. You have <strong>{student?.remainingEdits ?? 2} edit attempts</strong> remaining.
              </p>
            </div>
            <Link
              href="/student/profile"
              className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Complete Setup Now
            </Link>
          </div>
        )}

        {/* 1. Official Student Academic Identity Card */}
        <section className="bg-white rounded-lg p-6 sm:p-7 border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Initials Box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded bg-emerald-50 border border-emerald-200 overflow-hidden flex items-center justify-center font-bold text-xl text-emerald-900 flex-shrink-0">
              {student?.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                student?.fullName ? student.fullName.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>

            {/* Core Identification */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  {student?.fullName}
                </h1>
                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded uppercase">
                  Verified Student
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
                <span className="font-mono font-bold text-emerald-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {student?.matricNo || 'MATRIC PENDING'}
                </span>
                <button
                  onClick={handleCopyMatric}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                  type="button"
                >
                  {copiedMatric ? 'Copied' : 'Copy'}
                </button>
                <span>|</span>
                <span className="font-semibold text-slate-700">Basic Nursing (RN)</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                <span>Current Level: <strong className="text-slate-900">{student?.currentLevel || '100L'}</strong></span>
                <span>|</span>
                <span>Session: <strong className="text-emerald-800">{student?.activeSession || '2026/2027'}</strong></span>
                <span>|</span>
                <span>Cohort: <strong className="text-slate-800">{student?.admissionYear || 2026}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 w-full lg:w-auto">
            <Link
              href="/student/results"
              className="flex-1 lg:flex-initial w-full px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded text-center transition-colors"
            >
              Academic Transcript
            </Link>

            <Link
              href="/student/profile"
              className="flex-1 lg:flex-initial w-full px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 text-center transition-colors"
            >
              Biodata Profile
            </Link>
          </div>
        </section>

        {/* 2. Executive Academic Performance & Standing Strip */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CGPA Card */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cumulative CGPA</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold">
                5.00 Scale
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-emerald-900">{cgpa}</span>
              <span className="text-xs text-slate-400">/ 5.00</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-800 rounded-full"
                  style={{ width: `${cgpaPercentage}%` }}
                />
              </div>
              <p className="text-[11px] font-bold text-emerald-800">{standingClass}</p>
            </div>
          </div>

          {/* Registered Credit Units Card */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Credit Units Earned</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900">{totalCreditUnits}</span>
              <span className="text-xs text-slate-500">Units</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Passed course units across completed semesters.
            </p>
          </div>

          {/* Academic Standing Status Card */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Academic Standing</span>
            <p className="text-lg font-bold text-emerald-800">{standingTitle}</p>
            <p className="text-[11px] text-slate-500">
              50% pass mark standard. Enrolment active.
            </p>
          </div>

          {/* Clinical Posting Status Card */}
          <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Clinical Practicum</span>
            <p className="text-lg font-bold text-slate-900">Ward Postings Active</p>
            <p className="text-[11px] text-slate-500">
              Hospital ward rotation in progress.
            </p>
          </div>
        </section>

        {/* 3. Examination Results Records Summary */}
        <section className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Examination Records & Grade Summary
              </h2>
              <p className="text-xs text-slate-500">Session {student?.activeSession || '2026/2027'} | Semester Assessment Scores</p>
            </div>

            <div className="flex items-center gap-2">
              {isLocked ? (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded">
                  Lock Active
                </span>
              ) : (
                <Link
                  href="/student/results"
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
                >
                  Print Official Statement (PDF)
                </Link>
              )}
            </div>
          </div>

          {/* Release Countdown Box if scheduled */}
          {timeLeft ? (
            <div className="bg-slate-900 text-white rounded-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                  Official Academic Release Gate
                </span>
                <h3 className="text-lg font-bold">Results Scheduled for Release</h3>
                <p className="text-xs text-slate-300 max-w-md">
                  Examination results for {student?.currentLevel} are locked under official release schedule. Scores will unlock automatically when the timer reaches zero.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-800 border border-slate-700 p-2 rounded min-w-[56px]">
                  <span className="text-xl font-mono font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-slate-400 uppercase">Days</span>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-2 rounded min-w-[56px]">
                  <span className="text-xl font-mono font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-slate-400 uppercase">Hours</span>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-2 rounded min-w-[56px]">
                  <span className="text-xl font-mono font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-slate-400 uppercase">Mins</span>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-2 rounded min-w-[56px]">
                  <span className="text-xl font-mono font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] text-slate-400 uppercase">Secs</span>
                </div>
              </div>
            </div>
          ) : isLocked ? (
            <div className="py-8 text-center space-y-2 bg-amber-50 border border-amber-200 rounded p-6">
              <h3 className="text-sm font-bold text-amber-900">Results Under Administrative Lock</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                Scores for {student?.currentLevel} are being ratified by the Examination Committee and will unlock upon publication.
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 border border-slate-200 rounded p-6 space-y-1">
              <p className="font-semibold text-slate-700">No examination grades recorded yet for {student?.currentLevel || 'current session'}.</p>
              <p className="text-slate-400">Newly recorded examination marks from the board will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-institutional">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Units</th>
                    <th>CA (30)</th>
                    <th>Exam (70)</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>GP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.slice(0, 6).map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="font-mono font-bold text-emerald-900">{g.courseCode}</td>
                      <td className="font-bold text-slate-900">{g.courseTitle}</td>
                      <td className="font-bold text-slate-700">{g.unit}</td>
                      <td className="text-slate-600">{g.caScore}</td>
                      <td className="text-slate-600">{g.examScore}</td>
                      <td className="font-bold text-slate-900">{g.totalScore}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="font-bold text-slate-700">{Number(g.gradePoint).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {grades.length > 6 && (
                <div className="pt-3 text-center border-t border-slate-100">
                  <Link
                    href="/student/results"
                    className="text-xs font-bold text-emerald-800 hover:underline"
                  >
                    View all {grades.length} course results &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 4. Quick Access Hub & Regulations Notice */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/student/courses"
            className="bg-white p-5 rounded-lg border border-slate-200 hover:border-emerald-700 transition-colors flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Registered Curriculum Syllabus</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Browse semester course outlines, required credit units, and course codes.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800">&rarr;</span>
          </Link>

          <Link
            href="/student/policies"
            className="bg-white p-5 rounded-lg border border-slate-200 hover:border-emerald-700 transition-colors flex items-center justify-between"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Regulations Handbook</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review 50% pass mark rules, examination conduct, and clinical rotation policies.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800">&rarr;</span>
          </Link>
        </section>
      </main>

      <MobileBottomBar />
      <InstitutionalFooter />
    </div>
  );
}
