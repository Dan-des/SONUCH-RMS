import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Award } from 'lucide-react';
import type { SemesterResult } from '../../../types';
import { gradeColor } from '../../../types';

interface SemesterAccordionProps {
  result: SemesterResult;
  level: string;
  semester: number;
}

export function SemesterAccordion({ result, level, semester }: SemesterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sgpaColor =
    result.sgpa >= 4.5
      ? 'text-emerald-600 dark:text-emerald-400'
      : result.sgpa >= 3.5
      ? 'text-sky-600 dark:text-sky-400'
      : result.sgpa >= 2.5
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="accordion-row">
      {/* Header */}
      <button
        id={`accordion-${level}-sem${semester}`}
        className="accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
            <BookOpen size={16} className="text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--uch-fg)' }}>
              {level} — Semester {semester}
            </p>
            <p className="text-xs text-uch-muted mt-0.5">
              {result.academicSession} · {result.courses.length} Courses ·{' '}
              {result.totalCreditUnits} Credit Units
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* SGPA badge */}
          <div className="text-right">
            <p className="text-xs text-uch-muted font-medium">SGPA</p>
            <p className={`text-base font-bold ${sgpaColor}`}>{result.sgpa.toFixed(2)}</p>
          </div>
          {/* Published badge */}
          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <Award size={10} />
            Published
          </span>
          <div className="text-uch-muted">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Course table */}
      {isOpen && (
        <div className="animate-slide-down p-4 border-t border-uch-border/40" style={{ background: 'var(--uch-surface)' }}>
          {/* Summary row */}
          <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-uch-card border border-uch-border">
            <div className="text-center">
              <p className="text-xs text-uch-muted">Total C.U.</p>
              <p className="text-base font-bold" style={{ color: 'var(--uch-fg)' }}>{result.totalCreditUnits}</p>
            </div>
            <div className="w-px h-8 bg-uch-border" />
            <div className="text-center">
              <p className="text-xs text-uch-muted">Quality Points</p>
              <p className="text-base font-bold" style={{ color: 'var(--uch-fg)' }}>{result.totalQualityPoints.toFixed(2)}</p>
            </div>
            <div className="w-px h-8 bg-uch-border" />
            <div className="text-center">
              <p className="text-xs text-uch-muted">SGPA</p>
              <p className={`text-base font-bold ${sgpaColor}`}>{result.sgpa.toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[580px]">
              <thead>
                <tr className="text-xs text-uch-muted font-semibold uppercase tracking-wider border-b border-uch-border/40">
                  <th className="pb-2 text-left pr-3">Course Code</th>
                  <th className="pb-2 text-left">Course Title</th>
                  <th className="pb-2 text-center w-10">C.U.</th>
                  <th className="pb-2 text-center w-12">CA/30</th>
                  <th className="pb-2 text-center w-14">Exam/70</th>
                  <th className="pb-2 text-center w-14">Total</th>
                  <th className="pb-2 text-center w-10">Grade</th>
                  <th className="pb-2 text-center w-10">G.P.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-uch-border/20">
                {result.courses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="hover:bg-uch-card/40 transition-colors"
                  >
                    <td className="py-2.5 pr-3 font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold">
                      {course.courseCode}
                    </td>
                    <td className="py-2.5 text-xs leading-tight font-medium" style={{ color: 'var(--uch-fg)' }}>
                      {course.courseTitle}
                    </td>
                    <td className="py-2.5 text-center text-uch-muted">{course.creditUnits}</td>
                    <td className="py-2.5 text-center font-medium" style={{ color: 'var(--uch-fg)' }}>
                      {course.caScore ?? '—'}
                    </td>
                    <td className="py-2.5 text-center font-medium" style={{ color: 'var(--uch-fg)' }}>
                      {course.examScore ?? '—'}
                    </td>
                    <td className="py-2.5 text-center font-bold" style={{ color: 'var(--uch-fg)' }}>
                      {course.totalScore ?? '—'}
                    </td>
                    <td className={`py-2.5 text-center font-bold text-base ${gradeColor(course.grade)}`}>
                      {course.grade ?? '—'}
                    </td>
                    <td className="py-2.5 text-center text-uch-muted font-medium">
                      {course.gradePoint?.toFixed(1) ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
