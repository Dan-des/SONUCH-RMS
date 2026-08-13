'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  Printer,
  ShieldCheck,
  TrendingUp,
  User,
  Activity,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Loading Official Student Portal…
          </p>
        </div>
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
    standingClass = 'Distinction (4.50 – 5.00)';
  } else if (cgpaNumber >= 3.5) {
    standingClass = 'Upper Credit (3.50 – 4.49)';
  } else if (cgpaNumber >= 2.5) {
    standingClass = 'Lower Credit (2.50 – 3.49)';
  } else if (cgpaNumber >= 2.0) {
    standingClass = 'Pass (2.00 – 2.49)';
  } else if (cgpaNumber > 0) {
    standingClass = 'Probation Review (< 2.00)';
    standingTitle = 'Academic Review Required';
  } else {
    standingClass = 'Fresh Enrolment';
  }

  const cgpaPercentage = Math.min(100, Math.max(0, (cgpaNumber / 5.0) * 100));

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col pb-24 md:pb-12 text-slate-900 antialiased">
      {/* Institutional Top Navbar */}
      <StudentNavbar
        studentName={student?.fullName}
        matricNo={student?.matricNo}
        currentLevel={student?.currentLevel}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Profile Incomplete Warning Banner */}
        {isProfileIncomplete && (
          <div className="bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                  Student Demographic Profile Incomplete
                </h3>
                <p className="text-xs text-amber-800 font-medium mt-0.5 leading-relaxed">
                  Your official student record requires contact details, LGA, and State of Origin for verification. You have <strong>{student?.remainingEdits ?? 2} edit attempts</strong> remaining.
                </p>
              </div>
            </div>
            <Link
              href="/student/profile"
              className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Complete Setup Now</span>
            </Link>
          </div>
        )}

        {/* 1. Official Student Academic Identity Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Student Passport Photo */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-50 border-2 border-teal-200/80 overflow-hidden flex items-center justify-center font-black text-2xl text-teal-800 shadow-xs flex-shrink-0">
                {student?.avatarUrl ? (
                  <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student?.fullName ? student.fullName.substring(0, 2).toUpperCase() : 'ST'
                )}
              </div>
              <div
                className="absolute -bottom-1.5 -right-1.5 bg-emerald-600 text-white p-1 rounded-lg shadow-xs border-2 border-white"
                title="Verified Institutional Student"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Core Identification */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  {student?.fullName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black rounded-full uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Student
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg font-mono font-bold text-teal-900 border border-slate-200">
                  {student?.matricNo || 'MATRIC PENDING'}
                  <button
                    onClick={handleCopyMatric}
                    className="text-slate-400 hover:text-slate-700 ml-1"
                    title="Copy Matric No"
                  >
                    {copiedMatric ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
                <span>•</span>
                <span className="font-semibold text-slate-700">School of Nursing (Basic Nursing / RN)</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                <span className="font-semibold">Current Level: <strong className="text-slate-900 font-black">{student?.currentLevel || '100L'}</strong></span>
                <span>•</span>
                <span>Session: <strong className="text-teal-800 font-bold">{student?.activeSession || '2026/2027'}</strong></span>
                <span>•</span>
                <span>Admission: <strong className="text-slate-800">{student?.admissionYear || 2026}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2.5 border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 w-full lg:w-auto">
            <Link
              href="/student/results"
              className="flex-1 lg:flex-initial w-full px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-teal-200" />
              <span>Academic Transcript</span>
            </Link>

            <Link
              href="/student/profile"
              className="flex-1 lg:flex-initial w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span>Biodata Profile</span>
            </Link>
          </div>
        </section>

        {/* 2. Executive Academic Performance & Standing Dashboard Strip */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CGPA Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Cumulative CGPA
              </span>
              <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-extrabold">
                5.00 Scale
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-teal-900 tracking-tight">{cgpa}</span>
              <span className="text-xs font-bold text-slate-400">/ 5.00</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-700 rounded-full transition-all duration-500"
                  style={{ width: `${cgpaPercentage}%` }}
                />
              </div>
              <p className="text-[11px] font-extrabold text-teal-800">{standingClass}</p>
            </div>
          </div>

          {/* Registered Credit Units Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Credit Units Earned
              </span>
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCreditUnits}</span>
              <span className="text-xs font-bold text-slate-400">Units</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              Total cumulative passed course units across all semesters.
            </p>
          </div>

          {/* Academic Standing Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Academic Standing
              </span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Activity className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-emerald-800 tracking-tight">{standingTitle}</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              Minimum pass grade: 50% (C). Continuous enrolment eligible.
            </p>
          </div>

          {/* Clinical Posting Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                Clinical Practicum
              </span>
              <span className="p-1.5 bg-teal-50 text-teal-800 rounded-lg">
                <Layers className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 tracking-tight">Active Posting</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              UCH Wards & Practical Rotations in progress.
            </p>
          </div>
        </section>

        {/* 3. Examination Results Release Gate or Live Results Summary */}
        <section className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Examination Records & Grade Summary
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Session {student?.activeSession || '2026/2027'} • Official Semester Scores
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isLocked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded-full">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Automated Lock Active</span>
                </span>
              ) : (
                <Link
                  href="/student/results"
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-800" />
                  <span>Download Statement (PDF)</span>
                </Link>
              )}
            </div>
          </div>

          {/* Release Countdown Box if scheduled */}
          {timeLeft ? (
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-teal-100 border border-white/10">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Official Academic Board Release Schedule</span>
                </span>
                <h3 className="text-xl font-black tracking-tight">Results Scheduled for Release</h3>
                <p className="text-xs text-teal-100/90 max-w-md leading-relaxed">
                  Examination results for {student?.currentLevel} are currently locked under the official release countdown. Grades will unlock automatically at the expiration of this timer.
                </p>
              </div>

              {/* Digits Grid */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-2xl min-w-[64px]">
                  <span className="text-2xl font-mono font-black">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200 mt-0.5">Days</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-2xl min-w-[64px]">
                  <span className="text-2xl font-mono font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200 mt-0.5">Hours</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-2xl min-w-[64px]">
                  <span className="text-2xl font-mono font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200 mt-0.5">Mins</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2.5 rounded-2xl min-w-[64px]">
                  <span className="text-2xl font-mono font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200 mt-0.5">Secs</span>
                </div>
              </div>
            </div>
          ) : isLocked ? (
            <div className="py-10 text-center space-y-3 bg-amber-50/50 border border-dashed border-amber-200 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl mx-auto">
                <Lock className="w-6 h-6 text-amber-800" />
              </div>
              <h3 className="text-sm font-extrabold text-amber-900">Results Under Administrative Lock</h3>
              <p className="text-xs text-amber-700 max-w-md mx-auto leading-relaxed">
                Official scores for {student?.currentLevel} are being processed by the Academic Examination Committee and will unlock upon publication.
              </p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
              <Award className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">No examination grades recorded yet for {student?.currentLevel || 'current session'}.</p>
              <p className="text-[11px] text-slate-400">Newly recorded examination scores from the Academic Board will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Units</th>
                    <th className="py-3 px-4">CA (30)</th>
                    <th className="py-3 px-4">Exam (70)</th>
                    <th className="py-3 px-4">Total (100)</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {grades.slice(0, 6).map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{g.courseCode}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{g.courseTitle}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{g.unit}</td>
                      <td className="py-3.5 px-4 text-slate-600">{g.caScore}</td>
                      <td className="py-3.5 px-4 text-slate-600">{g.examScore}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{g.totalScore}</td>
                      <td className="py-3.5 px-4 font-extrabold text-teal-800">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{Number(g.gradePoint).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {grades.length > 6 && (
                <div className="pt-3 text-center border-t border-slate-100">
                  <Link
                    href="/student/results"
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-900"
                  >
                    <span>View all {grades.length} course results</span>
                    <ChevronRight className="w-3.5 h-3.5" />
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
            className="group bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Registered Nursing Syllabus</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Browse semester course outlines, required credit units, and course codes.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/student/policies"
            className="group bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Official Regulations Handbook</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Review 50% pass mark guidelines, examination conduct, and clinical rotation rules.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-1 transition-all" />
          </Link>
        </section>
      </main>

      <MobileBottomBar />
    </div>
  );
}
