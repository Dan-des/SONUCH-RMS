'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  GraduationCap,
  Layers,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';

const LEVELS = ['All Levels', '100L', '200L', '300L', '400L', '500L'];
const SEMESTERS = [
  { label: 'All Semesters', value: 'all' },
  { label: 'First Semester', value: '1' },
  { label: 'Second Semester', value: '2' },
];

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileAndCourses();
  }, []);

  const fetchProfileAndCourses = async () => {
    try {
      setLoading(true);
      const [profileRes, coursesRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/admin/courses'),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.student) {
          setStudent(pData.student);
          // Default level filter to student's current level
          if (pData.student.currentLevel) {
            setSelectedLevel(pData.student.currentLevel);
          }
        }
      }

      if (coursesRes.ok) {
        const cData = await coursesRes.json();
        setCourses(cData.courses || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses in memory
  const filteredCourses = courses.filter((c) => {
    if (selectedLevel !== 'All Levels' && c.level !== selectedLevel) return false;
    if (selectedSemester !== 'all' && String(c.semester) !== selectedSemester) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const codeMatch = c.code?.toLowerCase().includes(q);
      const titleMatch = c.title?.toLowerCase().includes(q);
      return codeMatch || titleMatch;
    }
    return true;
  });

  const totalUnits = filteredCourses.reduce((sum, c) => sum + (Number(c.unit) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8">
      <StudentNavbar
        studentName={student?.fullName}
        matricNo={student?.matricNo}
        currentLevel={student?.currentLevel}
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Curriculum & Course Catalogue</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official School of Nursing registered course modules, credit units, and semester syllabi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold rounded-xl shadow-xs">
              {filteredCourses.length} Courses ({totalUnits} Units)
            </span>
            <button
              onClick={fetchProfileAndCourses}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
              title="Refresh Curriculum"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-800' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter and Search Strip */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course code or title (e.g. NUR 101, Anatomy, Pharmacology)…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full md:w-40 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full md:w-48 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
            >
              {SEMESTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses List Table / Cards */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Registered Courses ({filteredCourses.length})
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Filter: {selectedLevel} • {selectedSemester === '1' ? 'First Semester' : selectedSemester === '2' ? 'Second Semester' : 'All Semesters'}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading course curriculum…</div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">No courses found matching selected filters.</p>
              <p className="text-[11px] text-slate-400">Try choosing a different level or clearing your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Course Code</th>
                    <th className="py-3 px-4">Course Title</th>
                    <th className="py-3 px-4">Credit Units</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{c.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.title}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">{c.unit} Unit{c.unit > 1 ? 's' : ''}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">{c.level}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Semester {c.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{c.session || '2026/2027'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <MobileBottomBar />
    </div>
  );
}
