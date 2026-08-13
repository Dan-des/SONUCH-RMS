'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  User,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';

const LEVELS = ['100L', '200L', '300L', '400L', '500L'];
const SEMESTERS = [
  { label: 'First Semester', value: 1 },
  { label: 'Second Semester', value: 2 },
];

export default function AdminResultsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [level, setLevel] = useState('100L');
  const [semester, setSemester] = useState<1 | 2>(1);
  const [caScore, setCaScore] = useState<number | ''>('');
  const [examScore, setExamScore] = useState<number | ''>('');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [rosterRes, coursesRes, sessionRes] = await Promise.all([
        fetch('/api/admin/roster'),
        fetch('/api/admin/courses'),
        fetch('/api/admin/session'),
      ]);

      if (rosterRes.ok) {
        const rData = await rosterRes.json();
        setStudents(rData.students || []);
        if (rData.students?.length > 0) {
          setSelectedStudentId(rData.students[0].id);
        }
      }

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
        if (cData.courses?.length > 0) {
          setSelectedCourseId(cData.courses[0].id);
        }
      }

      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        if (sData.activeSession) setActiveSession(sData.activeSession);
      }
    } catch (err) {
      console.error('Failed to load roster/courses for grade entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = (Number(caScore) || 0) + (Number(examScore) || 0);

  // Dynamic preview grade estimate
  let previewGrade = 'F';
  let previewPoint = 0.0;
  if (totalScore >= 70) { previewGrade = 'A'; previewPoint = 5.0; }
  else if (totalScore >= 60) { previewGrade = 'B'; previewPoint = 4.0; }
  else if (totalScore >= 50) { previewGrade = 'C'; previewPoint = 3.0; }
  else if (totalScore >= 45) { previewGrade = 'D'; previewPoint = 2.0; }

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      if (!selectedStudentId || !selectedCourseId) {
        throw new Error('Please select both a student and a course.');
      }

      const res = await fetch('/api/admin/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          courseId: selectedCourseId,
          caScore: Number(caScore) || 0,
          examScore: Number(examScore) || 0,
          session: activeSession,
          semester: Number(semester),
          level,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit grade');
      }

      setFeedback({ type: 'success', message: data.message });
      setCaScore('');
      setExamScore('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    return c.level === level && c.semester === semester;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Examination Results & Grade Processing"
        pageSubtitle="Record continuous assessment (CA 30) and terminal exam (70) scores with dynamic policy-driven GPA computation."
        showBack={true}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/90 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Direct Grade Entry Form
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Academic Session: <span className="font-bold text-teal-800">{activeSession}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleGradeSubmit} className="space-y-6">
            {/* Student Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-800" />
                <span>Select Registered Student</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.matricNo || 'No Matric'}) — {s.currentLevel} ({s.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Level & Semester Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-800" />
                <span>Course Module ({filteredCourses.length} available for {level} Sem {semester})</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
              >
                {filteredCourses.length === 0 ? (
                  <option value="">No registered courses for this level/semester. Please add in Courses tab.</option>
                ) : (
                  filteredCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.title} ({c.unit} Units)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Score Inputs (CA 30 + Exam 70) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Continuous Assessment / CA Score (Max 30)
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={caScore}
                  onChange={(e) => setCaScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 24"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Terminal Examination Score (Max 70)
                </label>
                <input
                  type="number"
                  min={0}
                  max={70}
                  value={examScore}
                  onChange={(e) => setExamScore(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 56"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Live Policy Preview Score Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Calculated Total Score</p>
                <p className="text-2xl font-black text-slate-900 mt-0.5">{totalScore} / 100</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Estimated Grade & Point</p>
                <p className="text-lg font-black text-teal-800 mt-0.5">
                  Grade {previewGrade} ({previewPoint.toFixed(1)} GP)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStudentId || !selectedCourseId}
              className="w-full py-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Recording Grade…' : 'Save & Publish Grade Record'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
