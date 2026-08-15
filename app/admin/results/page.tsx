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
  Trash2,
  FileText,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';

const LEVELS = ['100L', '200L', '300L', '400L', '500L'];
const ALL_LEVELS = ['All Levels', '100L', '200L', '300L', '400L', '500L'];
const SEMESTERS = [
  { label: 'First Semester', value: 1 },
  { label: 'Second Semester', value: 2 },
];

export default function AdminResultsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [recordedGrades, setRecordedGrades] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);

  // Form State
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [level, setLevel] = useState('100L');
  const [semester, setSemester] = useState<1 | 2>(1);
  const [caScore, setCaScore] = useState<number | ''>('');
  const [examScore, setExamScore] = useState<number | ''>('');

  // Table Filter State
  const [filterLevel, setFilterLevel] = useState('All Levels');
  const [searchFilter, setSearchFilter] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
    fetchRecordedGrades();
  }, []);

  useEffect(() => {
    fetchRecordedGrades();
  }, [filterLevel]);

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

  const fetchRecordedGrades = async () => {
    try {
      setGradesLoading(true);
      const query = new URLSearchParams();
      if (filterLevel !== 'All Levels') query.append('level', filterLevel);

      const res = await fetch(`/api/admin/grades?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setRecordedGrades(data.grades || []);
      }
    } catch (err) {
      console.error('Failed to fetch recorded grades:', err);
    } finally {
      setGradesLoading(false);
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
      fetchRecordedGrades();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recorded grade?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/grades?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Grade record deleted.' });
        fetchRecordedGrades();
      }
    } catch (err) {
      console.error('Failed to delete grade:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter((c) => {
    return c.level === level && c.semester === semester;
  });

  const displayGrades = recordedGrades.filter((g) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      g.studentName?.toLowerCase().includes(q) ||
      g.studentMatric?.toLowerCase().includes(q) ||
      g.courseCode?.toLowerCase().includes(q) ||
      g.courseTitle?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Examination Results & Grade Processing"
        pageSubtitle="Record continuous assessment (CA 30) and terminal exam (70) scores with dynamic GPA computation."
        showBack={true}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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

        {/* 1. Direct Grade Entry Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                  Record Student Examination Score
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Active Session: <span className="font-bold text-teal-800">{activeSession}</span>
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleGradeSubmit} className="space-y-5">
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
                  Continuous Assessment (CA 30)
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
                  Terminal Examination (Exam 70)
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Calculated Total</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{totalScore} / 100</p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Estimated Grade & Point</p>
                <p className="text-base font-black text-teal-800 mt-0.5">
                  Grade {previewGrade} ({previewPoint.toFixed(1)} GP)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedStudentId || !selectedCourseId}
              className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Recording Grade…' : 'Save & Publish Grade Record'}</span>
            </button>
          </form>
        </div>

        {/* 2. Recorded Grades Directory Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
                Recorded Student Results ({displayGrades.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Session {activeSession} • All entered examination scores.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search student or course…"
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 w-44 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
              >
                {ALL_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              <button
                onClick={() => fetchRecordedGrades()}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200"
                title="Refresh Grades"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${gradesLoading ? 'animate-spin text-teal-800' : ''}`} />
              </button>
            </div>
          </div>

          {gradesLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">Loading recorded grades…</div>
          ) : displayGrades.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-6">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-600">No grades recorded for this filter.</p>
              <p className="text-[11px] text-slate-400">Use the form above to record continuous assessment and exam scores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Matric No</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">CA (30)</th>
                    <th className="py-3 px-4">Exam (70)</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">GP</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {displayGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{g.studentName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">{g.studentMatric}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800">{g.courseCode}</span>
                        <span className="text-[11px] text-slate-500 block">{g.courseTitle}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{g.level}</td>
                      <td className="py-3 px-4 text-slate-600">{g.caScore}</td>
                      <td className="py-3 px-4 text-slate-600">{g.examScore}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{g.totalScore}</td>
                      <td className="py-3 px-4 font-black text-teal-800">
                        <span className="px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200">
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">{Number(g.gradePoint).toFixed(1)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteGrade(g.id)}
                          disabled={deletingId === g.id}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Grade"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
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
