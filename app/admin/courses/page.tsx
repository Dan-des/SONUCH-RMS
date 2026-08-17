'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { TableSkeletonLoader } from '../../../components/SkeletonLoader';

const LEVELS = ['100L', '200L', '300L', '400L', '500L'];
const SEMESTERS = [
  { label: 'First Semester', value: 1 },
  { label: 'Second Semester', value: 2 },
];

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState('2026/2027');

  // New course form state
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState(3);
  const [level, setLevel] = useState('100L');
  const [semester, setSemester] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/courses');
      const data = await res.json();
      if (res.ok) {
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          title: title.trim(),
          unit: Number(unit),
          level,
          semester: Number(semester),
          session: activeSession,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create course');
      }

      setFeedback({ type: 'success', message: data.message });
      setCode('');
      setTitle('');
      setUnit(3);
      fetchCourses();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (selectedLevel !== 'All Levels' && c.level !== selectedLevel) return false;
    if (selectedSemester !== 'all' && String(c.semester) !== selectedSemester) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return c.code?.toLowerCase().includes(q) || c.title?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Curriculum & Course Management"
        pageSubtitle="Register institutional nursing course modules, assign unit credits, and manage semester syllabi."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {feedback && (
          <div
            className={`p-3.5 rounded text-xs font-semibold border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Course Form Card */}
          <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
                Module Registration
              </span>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-1">
                Register New Course Module
              </h2>
              <p className="text-xs text-slate-500">Academic Session {activeSession}</p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. NUR 101"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Course Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Foundations of Nursing Science"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Credit Units
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={unit}
                    onChange={(e) => setUnit(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none"
                  >
                    {LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none"
                >
                  {SEMESTERS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition-colors"
              >
                {submitting ? 'Registering Module…' : 'Save & Register Course'}
              </button>
            </form>
          </div>

          {/* Courses Directory Table Card */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Registered Curriculum Catalogue ({filteredCourses.length})
                </h2>
                <p className="text-xs text-slate-500">Session {activeSession}</p>
              </div>

              <button
                onClick={fetchCourses}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors self-start sm:self-auto"
                type="button"
              >
                Refresh
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course code or title..."
                className="flex-1 w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
              />

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full sm:w-32 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="All Levels">All Levels</option>
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full sm:w-36 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="all">All Semesters</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>

            {loading ? (
              <TableSkeletonLoader rows={5} cols={5} />
            ) : filteredCourses.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
                <p className="font-semibold text-slate-700">No courses match the active filter criteria.</p>
                <p className="text-slate-400">Register new modules above or adjust filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-institutional">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Title</th>
                      <th>Units</th>
                      <th>Level</th>
                      <th>Semester</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="font-mono font-bold text-emerald-900">{c.code}</td>
                        <td className="font-bold text-slate-900">{c.title}</td>
                        <td className="font-bold text-slate-700">{c.unit}</td>
                        <td className="font-bold text-slate-800">{c.level}</td>
                        <td className="text-slate-600">Semester {c.semester}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
