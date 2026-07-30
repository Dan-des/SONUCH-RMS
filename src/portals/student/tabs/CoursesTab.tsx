import { useState } from 'react';
import { BookOpen, Layers, Search, AlertCircle, BookMarked, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { calculateCurrentLevel } from '../../../types';
import type { Level, Semester } from '../../../types';

const ALL_LEVELS: Level[] = ['100L', '200L', '300L', '400L', '500L'];

export function CoursesTab() {
  const { currentStudentId, students, courses, activeSystemSession } = useAppStore();
  const student = students.find((s) => s.id === currentStudentId) ?? students[0];

  const currentLevelStr = student ? calculateCurrentLevel(student.entrySession, activeSystemSession) : '100L';
  const maxLevelIdx = ALL_LEVELS.indexOf(currentLevelStr === 'Alumni' ? '500L' : (currentLevelStr as Level));
  const availableLevels = ALL_LEVELS.slice(0, Math.max(1, maxLevelIdx + 1));

  const [selectedLevel, setSelectedLevel] = useState<Level>(
    currentLevelStr === 'Alumni' ? '500L' : (currentLevelStr as Level)
  );
  const [selectedSemester, setSelectedSemester] = useState<Semester>(1);
  const [search, setSearch] = useState('');

  if (!student) return null;

  const levelSemesterCourses = courses.filter(
    (c) => c.level === selectedLevel && c.semester === selectedSemester
  );

  const filteredCourses = levelSemesterCourses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalCreditUnits = levelSemesterCourses.reduce((acc, c) => acc + c.creditUnits, 0);

  return (
    <div className="page-container px-4 pt-5 space-y-5 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-md">
              <BookMarked size={22} />
            </div>
            <div>
              <p className="text-uch-muted text-xs font-medium">Academic Curriculum</p>
              <h2 className="font-bold text-lg" style={{ color: 'var(--uch-fg)' }}>Course Directory</h2>
              <p className="text-uch-muted text-xs mt-0.5">
                School of Nursing, UCH · Enrolled &amp; Available Courses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-bold">
              Current Level: {currentLevelStr}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
              Session: {activeSystemSession}
            </span>
          </div>
        </div>
      </div>

      {/* Level & Semester Filters */}
      <div className="glass-card p-4 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-uch-border/40 pb-3">
          {/* Level Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-uch-muted uppercase mr-1 hidden sm:inline">Level:</span>
            {availableLevels.map((lvl) => {
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-uch-accent text-white shadow-md'
                      : 'bg-uch-surface border border-uch-border text-uch-muted hover:text-uch-fg'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-uch-surface border border-uch-border">
            <button
              onClick={() => setSelectedSemester(1)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedSemester === 1
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-uch-muted hover:text-uch-fg'
              }`}
            >
              Semester 1
            </button>
            <button
              onClick={() => setSelectedSemester(2)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedSemester === 2
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-uch-muted hover:text-uch-fg'
              }`}
            >
              Semester 2
            </button>
          </div>
        </div>

        {/* Search & Summary Stats */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-uch-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course code or title..."
              className="uch-input pl-9 py-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-uch-muted font-medium">
              Courses: <strong className="text-uch-fg font-bold">{levelSemesterCourses.length}</strong>
            </span>
            <span className="text-uch-muted font-medium">
              Total C.U.: <strong className="text-teal-600 dark:text-teal-400 font-bold">{totalCreditUnits} C.U.</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Course List / Grid */}
      <div className="space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="glass-card p-10 flex flex-col items-center justify-center text-center border-dashed">
            <BookOpen size={44} className="mb-3 opacity-30 text-teal-400" />
            <p className="font-bold text-base" style={{ color: 'var(--uch-fg)' }}>
              {search ? 'No Matching Courses Found' : `No Courses Uploaded for ${selectedLevel} Semester ${selectedSemester}`}
            </p>
            <p className="text-xs text-uch-muted max-w-sm mt-1">
              {search
                ? `No courses matched "${search}". Try adjusting your search query.`
                : 'No course curriculum has been uploaded for this level and semester yet by the Academic Department.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="glass-card p-4 flex flex-col justify-between hover:border-teal-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs flex-shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                        {course.code}
                      </span>
                      <h4 className="font-semibold text-sm leading-snug" style={{ color: 'var(--uch-fg)' }}>
                        {course.title}
                      </h4>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-uch-surface border border-uch-border text-xs font-bold text-uch-fg flex-shrink-0">
                    {course.creditUnits} C.U.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-uch-border/40 text-[11px] text-uch-muted">
                  <div className="flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-500" />
                    <span>{course.level} · Semester {course.semester}</span>
                  </div>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 size={12} /> Active Curriculum
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
