import { useState } from 'react';
import { Printer, ChevronDown, FileText, AlertCircle, X, BookOpen, CalendarDays } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { SemesterAccordion } from '../components/SemesterAccordion';
import { PrintReportCard, type PrintScope } from '../components/PrintReportCard';
import { calculateCurrentLevel, getSessionRange, ALL_SESSIONS } from '../../../types';
import type { Level, Student, SemesterResult } from '../../../types';

const LEVELS: Level[] = ['100L', '200L', '300L', '400L', '500L'];

// ─── Print Preview Overlay ────────────────────────────────────────────────────

interface PrintPreviewProps {
  student: Student;
  allResults: SemesterResult[];
  onClose: () => void;
}

function PrintPreview({ student, allResults, onClose }: PrintPreviewProps) {
  const { activeSystemSession } = useAppStore();
  const studentResults = allResults.filter((r) => r.studentId === student.id && r.isPublished);

  const allowedSessions = getSessionRange(student.entrySession, activeSystemSession);
  const maxLevel = calculateCurrentLevel(student.entrySession, activeSystemSession);
  const maxLevelIdx = maxLevel === 'Alumni' ? 4 : LEVELS.indexOf(maxLevel as Level);

  const [docType, setDocType] = useState<'full' | 'semester'>('full');
  const [selectedLevel, setSelectedLevel] = useState<Level>('100L');
  const [selectedSem, setSelectedSem] = useState<1 | 2>(1);
  const [selectedSession, setSelectedSession] = useState<string>(allowedSessions[allowedSessions.length - 1] || activeSystemSession);

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    // Auto-map session to corresponding level
    const mappedLevel = calculateCurrentLevel(student.entrySession, session);
    if (mappedLevel !== 'Alumni') {
      setSelectedLevel(mappedLevel);
    }
  };

  const scope: PrintScope =
    docType === 'semester'
      ? { mode: 'semester', level: selectedLevel, semester: selectedSem }
      : { mode: 'full' };

  const docLabel =
    docType === 'full'
      ? 'Full Academic Transcript'
      : `${selectedLevel} (${selectedSession}) — Semester ${selectedSem} Report`;

  const handlePrint = () => window.print();

  return (
    // Outer modal container — NOTE: NOT marked as .no-print so print engine can render inside it
    <div
      className="print-preview-modal fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(11,19,18,0.92)', backdropFilter: 'blur(8px)' }}
    >
      {/* ── Top control bar (marked .no-print so it hides on print) ── */}
      <div
        className="no-print flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: 'var(--uch-surface)', borderBottom: '1px solid var(--uch-border)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Printer size={18} className="text-teal-500" />
          <span className="font-semibold text-sm truncate" style={{ color: 'var(--uch-fg)' }}>
            {docLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="do-print-btn"
            onClick={handlePrint}
            className="uch-btn-gold text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-lg"
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: 'var(--uch-card)', color: 'var(--uch-muted)', border: '1px solid var(--uch-border)' }}
            title="Close Preview"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Secondary control strip (marked .no-print) ── */}
      <div
        className="no-print flex items-center gap-6 px-5 py-3 flex-shrink-0 flex-wrap gap-y-2"
        style={{ background: 'var(--uch-card)', borderBottom: '1px solid var(--uch-border)' }}
      >
        {/* Document type selector */}
        <div className="flex flex-col gap-1">
          <span className="uch-label" style={{ marginBottom: 0 }}>Document Type</span>
          <div
            className="flex rounded-xl overflow-hidden p-0.5"
            style={{ border: '1px solid var(--uch-border)', background: 'var(--uch-surface)' }}
          >
            <button
              id="print-type-semester"
              onClick={() => setDocType('semester')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: docType === 'semester' ? 'var(--uch-card)' : 'transparent',
                color: docType === 'semester' ? 'var(--uch-fg)' : 'var(--uch-muted)',
              }}
            >
              <BookOpen size={13} className={docType === 'semester' ? 'text-teal-500' : ''} />
              Semester Report
            </button>
            <button
              id="print-type-full"
              onClick={() => setDocType('full')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                background: docType === 'full'
                  ? 'linear-gradient(135deg, #0d9488, #0f766e)'
                  : 'transparent',
                color: docType === 'full' ? 'white' : 'var(--uch-muted)',
              }}
            >
              <FileText size={13} />
              Full Transcript
            </button>
          </div>
        </div>

        {/* Academic Session Filter */}
        <div className="flex flex-col gap-1">
          <span className="uch-label flex items-center gap-1" style={{ marginBottom: 0 }}>
            <CalendarDays size={11} className="text-uch-gold" />
            Academic Session
          </span>
          <select
            id="print-session-select"
            value={selectedSession}
            onChange={(e) => handleSessionChange(e.target.value)}
            disabled={docType === 'full'}
            className="uch-select py-1.5 text-xs font-semibold"
            style={{ minWidth: 130, opacity: docType === 'full' ? 0.4 : 1 }}
          >
            {allowedSessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Target level dropdowns */}
        <div className="flex flex-col gap-1">
          <span className="uch-label" style={{ marginBottom: 0 }}>Target Level</span>
          <div className="flex gap-2">
            <select
              id="print-level-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as Level)}
              disabled={docType === 'full'}
              className="uch-select py-1.5 text-xs font-medium"
              style={{ minWidth: 110, opacity: docType === 'full' ? 0.4 : 1 }}
            >
              {LEVELS.map((l, idx) => (
                <option key={l} value={l} disabled={idx > maxLevelIdx}>
                  {l} Level {idx > maxLevelIdx ? '(Future)' : ''}
                </option>
              ))}
            </select>
            <select
              id="print-sem-select"
              value={selectedSem}
              onChange={(e) => setSelectedSem(Number(e.target.value) as 1 | 2)}
              disabled={docType === 'full'}
              className="uch-select py-1.5 text-xs font-medium"
              style={{ minWidth: 110, opacity: docType === 'full' ? 0.4 : 1 }}
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Scrollable report card viewer ── */}
      <div className="print-preview-body flex-1 overflow-auto p-4 sm:p-6" style={{ background: '#f1f5f9' }}>
        <div className="print-card-wrapper max-w-4xl mx-auto rounded-xl shadow-xl bg-white">
          {/* Printable component */}
          <PrintReportCard student={student} results={studentResults} scope={scope} />
        </div>
      </div>
    </div>
  );
}

// ─── ResultsTab ───────────────────────────────────────────────────────────────

export function ResultsTab() {
  const { currentStudentId, students, results, activeSystemSession } = useAppStore();
  const student = students.find((s) => s.id === currentStudentId);

  const [filterLevel, setFilterLevel] = useState<Level | 'all'>('all');
  const [filterSession, setFilterSession] = useState<string>('all');
  const [showPrint, setShowPrint] = useState(false);

  if (!student) return null;

  const allowedSessions = getSessionRange(student.entrySession, activeSystemSession);
  const currentCalcLevel = calculateCurrentLevel(student.entrySession, activeSystemSession);
  const maxLevelIdx = currentCalcLevel === 'Alumni' ? 4 : LEVELS.indexOf(currentCalcLevel as Level);

  const studentResults = results.filter((r) => r.studentId === currentStudentId && r.isPublished);

  const semesterSlots: { level: Level; semester: 1 | 2 }[] = [];
  LEVELS.slice(0, maxLevelIdx + 1).forEach((level) => {
    semesterSlots.push({ level, semester: 1 });
    semesterSlots.push({ level, semester: 2 });
  });

  const filteredSlots = semesterSlots.filter((s) => {
    if (filterLevel !== 'all' && s.level !== filterLevel) return false;
    if (filterSession !== 'all') {
      const mappedLevel = calculateCurrentLevel(student.entrySession, filterSession);
      if (s.level !== mappedLevel) return false;
    }
    return true;
  });

  return (
    <div className="page-container px-4 pt-5">
      {/* Print Preview Overlay */}
      {showPrint && (
        <PrintPreview
          student={student}
          allResults={results}
          onClose={() => setShowPrint(false)}
        />
      )}

      {/* ── Header ── */}
      <div className="no-print flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-teal-600 dark:text-teal-400" />
          <h2 className="font-bold text-base" style={{ color: 'var(--uch-fg)' }}>
            Academic Results
          </h2>
        </div>
        <button
          id="print-report-card-btn"
          onClick={() => setShowPrint(true)}
          className="flex items-center gap-2 uch-btn-gold text-xs py-2 px-4 shadow-md font-semibold"
        >
          <Printer size={14} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* ── Filters: Session & Level ── */}
      <div className="no-print flex items-center gap-3 mb-4 glass-card p-3 flex-wrap">
        {/* Academic Session */}
        <div className="flex items-center gap-2">
          <label htmlFor="session-filter-select" className="uch-label mb-0 flex-shrink-0 flex items-center gap-1">
            <CalendarDays size={12} className="text-uch-gold" />
            Session:
          </label>
          <select
            id="session-filter-select"
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="uch-select py-1.5 text-xs font-semibold"
            style={{ minWidth: 120 }}
          >
            <option value="all">All Sessions</option>
            {allowedSessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div className="flex items-center gap-2">
          <label htmlFor="level-filter-select" className="uch-label mb-0 flex-shrink-0">
            Level:
          </label>
          <select
            id="level-filter-select"
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as Level | 'all')}
            className="uch-select py-1.5 text-xs font-semibold"
            style={{ minWidth: 120 }}
          >
            <option value="all">All Levels</option>
            {LEVELS.slice(0, maxLevelIdx + 1).map((l) => (
              <option key={l} value={l}>{l} Level</option>
            ))}
          </select>
        </div>

        <span className="text-xs font-medium ml-auto hidden sm:inline" style={{ color: 'var(--uch-muted)' }}>
          Current: <strong className="text-teal-600 dark:text-teal-400">{currentCalcLevel}</strong> ({activeSystemSession})
        </span>
      </div>

      {/* ── Semester Accordions ── */}
      <div className="no-print space-y-0">
        {filteredSlots.map(({ level, semester }) => {
          const result = studentResults.find(
            (r) => r.level === level && r.semester === semester
          );

          if (!result) {
            return (
              <div key={`${level}-${semester}`} className="accordion-row opacity-50">
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{ background: 'var(--uch-card)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'var(--uch-border)', opacity: 0.4 }}
                    >
                      <ChevronDown size={16} style={{ color: 'var(--uch-muted)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--uch-muted)' }}>
                        {level} — Semester {semester}
                      </p>
                      <p
                        className="text-xs mt-0.5 flex items-center gap-1"
                        style={{ color: 'var(--uch-muted)', opacity: 0.5 }}
                      >
                        <AlertCircle size={10} />
                        Result not yet published
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <SemesterAccordion
              key={`${level}-${semester}`}
              result={result}
              level={level}
              semester={semester}
            />
          );
        })}
      </div>

      <div className="h-4" />
    </div>
  );
}
