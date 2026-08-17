'use client';

import React, { useState, useEffect } from 'react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';
import { TableSkeletonLoader } from '../../../components/SkeletonLoader';

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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 text-slate-900">
      <StudentNavbar
        studentName={student?.fullName}
        matricNo={student?.matricNo}
        currentLevel={student?.currentLevel}
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Curriculum Catalogue
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Registered Nursing Course Outlines
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Official School of Nursing registered course modules, credit units, and semester syllabi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded">
              {filteredCourses.length} Courses ({totalUnits} Units)
            </span>
            <button
              onClick={fetchProfileAndCourses}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-semibold transition-colors"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filter and Search Strip */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course code or title (e.g. NUR 101, Anatomy, Pharmacology)..."
            className="flex-1 w-full px-3.5 py-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full md:w-36 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full md:w-44 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
            >
              {SEMESTERS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Courses List Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Registered Courses ({filteredCourses.length})
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Filter: {selectedLevel} | {selectedSemester === '1' ? 'First Semester' : selectedSemester === '2' ? 'Second Semester' : 'All Semesters'}
            </span>
          </div>

          {loading ? (
            <TableSkeletonLoader rows={5} cols={6} />
          ) : filteredCourses.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
              <p className="font-semibold text-slate-700">No courses found matching selected filters.</p>
              <p className="text-slate-400">Try choosing a different level or clearing your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-institutional">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credit Units</th>
                    <th>Level</th>
                    <th>Semester</th>
                    <th>Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="font-mono font-bold text-emerald-900">{c.code}</td>
                      <td className="font-bold text-slate-900">{c.title}</td>
                      <td className="font-bold text-slate-700">{c.unit} Unit{c.unit > 1 ? 's' : ''}</td>
                      <td className="font-bold text-slate-800">{c.level}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Semester {c.semester}
                        </span>
                      </td>
                      <td className="text-slate-500">{c.session || '2026/2027'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <MobileBottomBar />
      <InstitutionalFooter />
    </div>
  );
}
