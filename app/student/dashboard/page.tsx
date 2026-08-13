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
  User,
  AlertCircle,
  Edit3,
  Calendar,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any>(null);
  const [releaseStatus, setReleaseStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

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
  const cgpa = Number(gradesData?.cgpa || 0).toFixed(2);
  const totalCreditUnits = gradesData?.totalCreditUnits || 0;
  const isLocked = releaseStatus?.isLocked;
  const isProfileIncomplete = !student?.phone || !student?.stateOfOrigin || !student?.dateOfBirth;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8 text-slate-900">
      {/* Student Light Navbar */}
      <StudentNavbar
        studentName={student?.fullName}
        matricNo={student?.matricNo}
        currentLevel={student?.currentLevel}
      />

      {/* Main Student Hub Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Incomplete Notice Banner */}
        {isProfileIncomplete && (
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-800" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-900">Demographic Profile Setup Incomplete</h3>
                <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
                  You have not yet completed your student biodata and contact information. You have <strong>{student?.remainingEdits ?? 2} edit attempts</strong> available.
                </p>
              </div>
            </div>
            <Link
              href="/student/profile"
              className="px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Complete Profile Setup</span>
            </Link>
          </div>
        )}

        {/* 1. Read-Only Core Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Academic Session</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{student?.activeSession || '2026/2027'}</p>
              <p className="text-[11px] text-teal-700 font-bold">Standard Term</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Current Level</p>
              <p className="text-lg font-black text-emerald-900 mt-0.5">{student?.currentLevel || '100L'}</p>
              <p className="text-[11px] text-slate-500 font-medium">Class of {student?.admissionYear}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-800 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Results Released</p>
              <p className="text-lg font-black text-indigo-900 mt-0.5">{grades.length} Recorded</p>
              <p className="text-[11px] text-indigo-700 font-semibold">{totalCreditUnits} Credit Units</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cumulative CGPA</p>
              <p className="text-lg font-black text-amber-900 mt-0.5">{cgpa} / 5.00</p>
              <p className="text-[11px] text-amber-700 font-bold">Standing: Good</p>
            </div>
          </div>
        </div>

        {/* 2. Result Release Countdown Component */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-800" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Automated Result Release Schedule
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Cohort: {student?.currentLevel}
            </span>
          </div>

          {timeLeft ? (
            <div className="bg-gradient-to-r from-teal-800 to-teal-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-700/60 rounded-full text-xs font-bold text-teal-100">
                  <Lock className="w-3.5 h-3.5" />
                  Upcoming Semester Result Release
                </span>
                <h3 className="text-lg font-black mt-2">Release Countdown in Progress</h3>
                <p className="text-xs text-teal-100">
                  Your results will be unlocked automatically on {new Date(releaseStatus.releaseDate).toLocaleString()}.
                </p>
              </div>

              {/* Digits Grid */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-xl font-mono font-black">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200">Days</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-xl font-mono font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200">Hours</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-xl font-mono font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200">Mins</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-xl">
                  <span className="text-xl font-mono font-black">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-teal-200">Secs</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-teal-800" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  No upcoming result release scheduled for {student?.currentLevel}.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-full">
                Active & Unlocked
              </span>
            </div>
          )}
        </div>

        {/* 3. Latest Result Summary Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-200 overflow-hidden flex items-center justify-center font-black text-xl text-teal-800 shadow-xs flex-shrink-0">
              {student?.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full object-cover" />
              ) : (
                student?.fullName ? student.fullName.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/student/results"
              className="flex-1 md:flex-initial px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>View Full Results & Transcript</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/student/courses"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-800" />
              <span>Curriculum</span>
            </Link>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/student/courses"
            className="group bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Registered Nursing Courses</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Browse curriculum, course codes, and unit weights.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-1 transition-all" />
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
                <h3 className="text-sm font-black text-slate-900">Academic Regulations Handbook</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Review pass mark thresholds (50%), clinical rules, and exam bylaws.
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-800 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </main>

      <MobileBottomBar />
    </div>
  );
}
