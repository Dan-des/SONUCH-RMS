import { useState, useCallback } from 'react';
import {
  ChevronLeft,
  Menu,
  X,
  Save,
  Rocket,
  Plus,
  Trash2,
  Pencil,
  Check,
  AlertCircle,
  BookOpen,
  CalendarDays,
  Sliders,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AcademicPolicyModal } from './components/AcademicPolicyModal';
import { calcGrade, calcGradePoint, gradeColor, calculateCurrentLevel, generateDynamicSessions } from '../../types';
import type { Level, LetterGrade } from '../../types';

const LEVELS: Level[] = ['100L', '200L', '300L', '400L', '500L'];

// ─── Grade badge ─────────────────────────────────────────────────────────────

function GradeBadge({ grade, gp }: { grade: LetterGrade | null; gp: number | null }) {
  if (!grade) return <span className="text-uch-muted/40 text-xs">—</span>;
  return (
    <div className="flex flex-col items-center leading-none">
      <span className={`text-base font-bold ${gradeColor(grade)}`}>{grade}</span>
      <span className="text-uch-muted text-xs">{gp?.toFixed(1)}</span>
    </div>
  );
}

// ─── Course Curriculum Drawer ─────────────────────────────────────────────────

function CourseCurriculumDrawer({ onClose }: { onClose: () => void }) {
  const {
    courses,
    adminSelectedLevel,
    adminSelectedSemester,
    addCourse,
    updateCourse,
    deleteCourse,
    addNotification,
  } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New course form state
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCU, setNewCU] = useState('3');
  const [newLevel, setNewLevel] = useState<Level>(adminSelectedLevel);
  const [newSem, setNewSem] = useState<1 | 2>(adminSelectedSemester);

  // Edit state
  const [editCode, setEditCode] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCU, setEditCU] = useState('');

  const levelCourses = courses.filter(
    (c) => c.level === adminSelectedLevel && c.semester === adminSelectedSemester
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = newCode.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!formattedCode || !newTitle.trim()) {
      addNotification('warning', 'Please enter a valid course code and title.');
      return;
    }

    const cleanCode = formattedCode.replace(/\s+/g, '');
    const isDuplicate = courses.some(
      (c) => c.code.replace(/\s+/g, '').toUpperCase() === cleanCode
    );
    if (isDuplicate) {
      addNotification('warning', `Course code "${formattedCode}" already exists!`);
      return;
    }

    addCourse({
      code: formattedCode,
      title: newTitle.trim(),
      creditUnits: Math.max(1, Math.min(6, parseInt(newCU) || 3)),
      level: newLevel,
      semester: newSem,
    });
    setNewCode('');
    setNewTitle('');
    setNewCU('3');
    setShowAddForm(false);
  };

  const startEdit = (id: string, code: string, title: string, cu: number) => {
    setEditingId(id);
    setEditCode(code);
    setEditTitle(title);
    setEditCU(String(cu));
  };

  const saveEdit = (id: string) => {
    const formattedCode = editCode.trim().replace(/\s+/g, ' ').toUpperCase();
    if (!formattedCode || !editTitle.trim()) {
      addNotification('warning', 'Please enter a valid course code and title.');
      return;
    }

    const cleanCode = formattedCode.replace(/\s+/g, '');
    const isDuplicate = courses.some(
      (c) => c.id !== id && c.code.replace(/\s+/g, '').toUpperCase() === cleanCode
    );
    if (isDuplicate) {
      addNotification('warning', `Course code "${formattedCode}" already exists!`);
      return;
    }

    updateCourse(id, {
      code: formattedCode,
      title: editTitle.trim(),
      creditUnits: Math.max(1, Math.min(6, parseInt(editCU) || 3)),
    });
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-uch-surface border-l border-uch-border flex flex-col animate-slide-down h-full overflow-hidden"
        style={{ animation: 'slideInRight 0.3s ease-out' }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-uch-border bg-uch-card">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-orange-500" />
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--uch-fg)' }}>Course Curriculum Manager</h3>
              <p className="text-uch-muted text-xs">
                {adminSelectedLevel} · Semester {adminSelectedSemester}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-uch-surface flex items-center justify-center text-uch-muted hover:text-uch-fg">
            <X size={15} />
          </button>
        </div>

        {/* Add button */}
        <div className="px-5 py-3 border-b border-uch-border/40">
          <button
            id="add-course-btn"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 uch-btn-primary text-xs py-2 px-4"
          >
            <Plus size={14} />
            Add New Course
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleAdd} className="px-5 py-4 border-b border-uch-border/40 space-y-3 bg-uch-dark/20 animate-slide-down">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="uch-label">Code</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="NUR 601"
                  className="uch-input font-mono text-sm"
                  required
                />
              </div>
              <div>
                <label className="uch-label">Credit Units</label>
                <input
                  type="number"
                  value={newCU}
                  onChange={(e) => setNewCU(e.target.value)}
                  min={1}
                  max={6}
                  className="uch-input text-sm"
                />
              </div>
            </div>
            <div>
              <label className="uch-label">Course Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Full course title…"
                className="uch-input text-sm"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="uch-label">Level</label>
                <select value={newLevel} onChange={(e) => setNewLevel(e.target.value as Level)} className="uch-input text-sm">
                  {LEVELS.map((l) => <option key={l} value={l} className="bg-uch-surface">{l}</option>)}
                </select>
              </div>
              <div>
                <label className="uch-label">Semester</label>
                <select value={newSem} onChange={(e) => setNewSem(parseInt(e.target.value) as 1 | 2)} className="uch-input text-sm">
                  <option value={1} className="bg-uch-surface">Semester 1</option>
                  <option value={2} className="bg-uch-surface">Semester 2</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddForm(false)} className="uch-btn-secondary flex-1 text-xs py-2">Cancel</button>
              <button type="submit" className="uch-btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1">
                <Plus size={13} /> Add Course
              </button>
            </div>
          </form>
        )}

        {/* Course List */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {levelCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-uch-muted glass-card border-dashed">
              <BookOpen size={40} className="mb-3 opacity-30 text-teal-400" />
              <p className="text-sm font-bold text-uch-fg text-center">
                No courses added for {adminSelectedLevel} Semester {adminSelectedSemester} yet
              </p>
              <p className="text-xs mt-1 text-center opacity-70">
                Click "+ Add New Course" above to begin building curriculum.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 uch-btn-gold text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md"
              >
                <Plus size={14} />
                Add First Course
              </button>
            </div>
          ) : (
            levelCourses.map((course) => (
              <div key={course.id} className="glass-card p-3.5">
                {editingId === course.id ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="uch-label">Course Code</label>
                        <input
                          type="text"
                          value={editCode}
                          onChange={(e) => setEditCode(e.target.value)}
                          placeholder="e.g. CHM 107"
                          className="uch-input font-mono text-xs py-2"
                        />
                      </div>
                      <div>
                        <label className="uch-label">Credit Units</label>
                        <input
                          type="number"
                          value={editCU}
                          onChange={(e) => setEditCU(e.target.value)}
                          min={1}
                          max={6}
                          className="uch-input text-xs py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="uch-label">Course Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Course title…"
                        className="uch-input text-xs py-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-xl bg-uch-surface border border-uch-border text-xs font-semibold text-uch-muted hover:text-uch-fg flex items-center gap-1"
                      >
                        <X size={13} /> Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(course.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 flex items-center gap-1"
                      >
                        <Check size={13} /> Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-uch-accent">{course.code}</span>
                        <span className="text-xs text-uch-muted">· {course.creditUnits} C.U.</span>
                      </div>
                      <p className="text-sm text-white font-medium mt-0.5 leading-tight">{course.title}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(course.id, course.code, course.title, course.creditUnits)}
                        className="w-7 h-7 rounded-lg bg-uch-surface border border-uch-border flex items-center justify-center text-uch-muted hover:text-uch-accent transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="w-7 h-7 rounded-lg bg-uch-surface border border-uch-border flex items-center justify-center text-uch-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── Score Row ─────────────────────────────────────────────────────────────────

interface ScoreRowProps {
  student: { id: string; matricNo: string };
  courseId: string;
  existingCA: number | null;
  existingExam: number | null;
  level: Level;
  semester: 1 | 2;
  session: string;
}

function ScoreRow({ student, courseId, existingCA, existingExam, level, semester, session }: ScoreRowProps) {
  const { setDraftScore, getDraftScore, academicPolicy, deleteStudentCourseResult, addNotification } = useAppStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const draft = getDraftScore(student.id, courseId);

  const maxCA = academicPolicy.isConfigured ? academicPolicy.maxCA : 30;
  const maxExam = academicPolicy.isConfigured ? academicPolicy.maxExam : 70;

  const ca = draft?.caScore !== undefined ? draft.caScore : existingCA;
  const exam = draft?.examScore !== undefined ? draft.examScore : existingExam;

  // Determine if student score has been modified relative to DB record
  const isModified =
    (draft?.caScore !== undefined && draft?.caScore !== existingCA) ||
    (draft?.examScore !== undefined && draft?.examScore !== existingExam);

  const total = ca !== null && exam !== null ? ca + exam : null;
  const grade = total !== null ? calcGrade(total, academicPolicy) : null;
  const gp = grade !== null ? calcGradePoint(grade, academicPolicy) : null;

  const handleCA = useCallback(
    (v: string) => {
      const num = v === '' ? null : Math.max(0, Math.min(maxCA, parseInt(v) || 0));
      setDraftScore(student.id, courseId, 'caScore', num);
    },
    [student.id, courseId, maxCA, setDraftScore]
  );

  const handleExam = useCallback(
    (v: string) => {
      const num = v === '' ? null : Math.max(0, Math.min(maxExam, parseInt(v) || 0));
      setDraftScore(student.id, courseId, 'examScore', num);
    },
    [student.id, courseId, maxExam, setDraftScore]
  );

  const handleDeleteConfirm = () => {
    deleteStudentCourseResult(student.id, courseId, level, semester, session);
    setConfirmDelete(false);
    addNotification('success', `Result for ${student.matricNo} deleted successfully.`);
  };

  const caInvalid = ca !== null && (ca < 0 || ca > maxCA);
  const examInvalid = exam !== null && (exam < 0 || exam > maxExam);
  const hasScores = ca !== null || exam !== null || total !== null;

  return (
    <tr className="border-b border-uch-border/20 hover:bg-uch-surface/30 transition-colors">
      <td className="py-2.5 px-3 text-xs font-mono text-uch-accent font-semibold whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span>{student.matricNo}</span>
          {isModified && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 tracking-tight">
              EDITED
            </span>
          )}
        </div>
      </td>
      <td className="py-2.5 px-2">
        <input
          type="number"
          value={ca ?? ''}
          onChange={(e) => handleCA(e.target.value)}
          min={0}
          max={maxCA}
          placeholder="0"
          className={`score-input ${caInvalid ? 'border-red-500/60 text-red-400' : ''} ${isModified ? 'border-amber-500/50' : ''}`}
          title={`CA Score (max ${maxCA})`}
        />
      </td>
      <td className="py-2.5 px-2">
        <input
          type="number"
          value={exam ?? ''}
          onChange={(e) => handleExam(e.target.value)}
          min={0}
          max={maxExam}
          placeholder="0"
          className={`score-input ${examInvalid ? 'border-red-500/60 text-red-400' : ''} ${isModified ? 'border-amber-500/50' : ''}`}
          title={`Exam Score (max ${maxExam})`}
        />
      </td>
      <td className="py-2.5 px-3 text-center">
        <span
          className={`text-sm font-bold ${
            total !== null
              ? total >= 70
                ? 'text-emerald-600 dark:text-white'
                : total >= 50
                ? 'text-yellow-600 dark:text-yellow-300'
                : 'text-red-500 dark:text-red-400'
              : 'text-uch-muted/30'
          }`}
        >
          {total ?? '—'}
        </span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <GradeBadge grade={grade} gp={gp} />
      </td>
      <td className="py-2.5 px-3 text-center">
        {confirmDelete ? (
          <div className="flex flex-col items-center justify-center gap-1 animate-fade-in">
            <span className="text-[10px] text-red-500 font-bold leading-tight">Delete for {student.matricNo}?</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700 shadow-sm"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-1.5 py-0.5 bg-slate-200 dark:bg-uch-card text-slate-700 dark:text-uch-muted rounded text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={!hasScores}
            className={`p-1.5 rounded-lg transition-colors ${
              hasScores
                ? 'text-slate-400 hover:text-red-500 hover:bg-red-500/10'
                : 'text-slate-300 dark:text-uch-border/40 cursor-not-allowed'
            }`}
            title={`Delete result for ${student.matricNo}`}
          >
            <Trash2 size={15} />
          </button>
        )}
      </td>
    </tr>
  );
}

// ─── Result Processing Page ────────────────────────────────────────────────────

export function ResultProcessing() {
  const {
    setAdminView,
    students,
    courses,
    results,
    adminSelectedLevel,
    adminSelectedSemester,
    adminSelectedCourseId,
    adminSelectedSession,
    setAdminSelectedLevel,
    setAdminSelectedSemester,
    setAdminSelectedCourseId,
    setAdminSelectedSession,
    saveDraft,
    publishResults,
    academicPolicy,
  } = useAppStore();

  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const levelCourses = courses.filter(
    (c) => c.level === adminSelectedLevel && c.semester === adminSelectedSemester && c.status === 'active'
  );

  const selectedCourse = adminSelectedCourseId
    ? levelCourses.find((c) => c.id === adminSelectedCourseId) ?? levelCourses[0]
    : levelCourses[0];

  // Build existing score lookup — session-scoped
  const getExistingScore = (studentId: string, courseId: string) => {
    const result = results.find(
      (r) =>
        r.studentId === studentId &&
        r.academicSession === adminSelectedSession &&
        r.level === adminSelectedLevel &&
        r.semester === adminSelectedSemester
    );
    const courseResult = result?.courses.find((c) => c.courseId === courseId);
    return { ca: courseResult?.caScore ?? null, exam: courseResult?.examScore ?? null };
  };

  const handlePublish = async () => {
    setPublishing(true);
    await new Promise((r) => setTimeout(r, 1200));
    publishResults(adminSelectedLevel, adminSelectedSemester);
    setPublishing(false);
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* Unconfigured Academic Policy Warning Banner */}
      {!academicPolicy.isConfigured && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs flex items-center justify-between flex-wrap gap-2 animate-slide-down">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400 flex-shrink-0" />
            <span>
              <strong>First-Time Institutional Setup Required:</strong> Please configure your <strong>Academic Policy &amp; Assessment Ratios</strong> before entering scores.
            </span>
          </div>
          <button
            onClick={() => setShowPolicyModal(true)}
            className="uch-btn-gold text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold shadow-md"
          >
            <Sliders size={13} />
            Configure Policy Now
          </button>
        </div>
      )}

      {/* Sub-header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-uch-border/40 bg-slate-50 dark:bg-uch-surface/50">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setAdminView('hub')}
            className="w-8 h-8 rounded-xl bg-white dark:bg-uch-surface flex items-center justify-center text-slate-500 dark:text-uch-muted hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-uch-border transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">Result Processing</h2>
            <p className="text-slate-500 dark:text-uch-muted text-xs">Manual score entry &amp; publishing</p>
          </div>
          {/* Hamburger menu */}
          <button
            id="curriculum-manager-btn"
            onClick={() => setShowCurriculum(true)}
            className="flex items-center gap-1.5 uch-btn-secondary text-xs py-2 px-3"
            title="Course Curriculum Manager"
          >
            <Menu size={14} />
            <span className="hidden sm:inline">Manage Courses</span>
          </button>
        </div>

        {/* Filters: Session / Level / Semester / Course */}
        <div className="flex gap-2 flex-wrap items-end">

          {/* Academic Session */}
          <div className="flex flex-col gap-1">
            <label htmlFor="rp-session" className="uch-label flex items-center gap-1">
              <CalendarDays size={11} className="text-orange-500" />
              Session
            </label>
            <select
              id="rp-session"
              value={adminSelectedSession}
              onChange={(e) => setAdminSelectedSession(e.target.value)}
              className="uch-select py-2 text-xs font-semibold bg-white dark:bg-uch-surface"
              style={{ minWidth: 120 }}
            >
              {generateDynamicSessions([
                ...results.map((r) => r.academicSession),
                ...students.map((s) => s.entrySession),
              ]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="flex flex-col gap-1">
            <label htmlFor="rp-level" className="uch-label">Level</label>
            <select
              id="rp-level"
              value={adminSelectedLevel}
              onChange={(e) => setAdminSelectedLevel(e.target.value as Level)}
              className="uch-select py-2 text-xs bg-white dark:bg-uch-surface"
              style={{ minWidth: 95 }}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div className="flex flex-col gap-1">
            <label htmlFor="rp-semester" className="uch-label">Semester</label>
            <select
              id="rp-semester"
              value={adminSelectedSemester}
              onChange={(e) => setAdminSelectedSemester(Number(e.target.value) as 1 | 2)}
              className="uch-select py-2 text-xs bg-white dark:bg-uch-surface"
              style={{ minWidth: 110 }}
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>

          {/* Course */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="rp-course" className="uch-label">Course</label>
            {levelCourses.length > 0 ? (
              <select
                id="rp-course"
                value={adminSelectedCourseId ?? levelCourses[0]?.id ?? ''}
                onChange={(e) => setAdminSelectedCourseId(e.target.value)}
                className="uch-select py-2 text-xs bg-white dark:bg-uch-surface"
              >
                {levelCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.title} ({c.creditUnits} C.U.)
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 text-xs py-2 px-3 rounded-xl bg-white dark:bg-uch-surface border border-slate-200 dark:border-uch-border text-slate-500 dark:text-uch-muted">
                <AlertCircle size={13} className="text-amber-500 flex-shrink-0" />
                No courses — use Manage Courses to add
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Score Entry Grid */}
      <div className="flex-1 overflow-auto px-4 py-3">
        {!selectedCourse ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-uch-muted glass-card border-dashed">
            <BookOpen size={44} className="mb-3 opacity-30 text-teal-500" />
            <p className="font-bold text-base text-slate-900 dark:text-white text-center">No Curriculum Courses Available</p>
            <p className="text-xs max-w-sm text-center opacity-70 mt-1">
              No courses exist for {adminSelectedLevel} Semester {adminSelectedSemester}. Click "Manage Courses" above to populate the curriculum.
            </p>
            <button
              onClick={() => setShowCurriculum(true)}
              className="mt-4 uch-btn-gold text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md"
            >
              <Menu size={14} />
              Manage Courses Now
            </button>
          </div>
        ) : (
          <>
            {/* Course info */}
            <div className="glass-card p-3.5 mb-4 flex items-center gap-3 bg-slate-50 dark:bg-uch-card border border-slate-200 dark:border-uch-border">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <BookOpen size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">{selectedCourse.code}</p>
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{selectedCourse.title}</p>
                <p className="text-xs text-slate-500 dark:text-uch-muted">
                  {adminSelectedSession} · {adminSelectedLevel} · Semester {adminSelectedSemester} · {selectedCourse.creditUnits} C.U.
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto glass-card border border-slate-200 dark:border-uch-border">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-uch-card border-b border-slate-200 dark:border-uch-border text-slate-700 dark:text-uch-muted">
                    <th className="py-3 px-3 text-left text-xs font-bold uppercase tracking-wider">
                      Matric No.
                    </th>
                    <th className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider">
                      CA<br /><span className="text-slate-400 dark:text-uch-muted/50 normal-case font-normal">(max 30)</span>
                    </th>
                    <th className="py-3 px-2 text-center text-xs font-bold uppercase tracking-wider">
                      Exam<br /><span className="text-slate-400 dark:text-uch-muted/50 normal-case font-normal">(max 70)</span>
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider">
                      Total
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider">
                      Grade / G.P.
                    </th>
                    <th className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rosterStudents = students.filter(
                      (s) => calculateCurrentLevel(s.entrySession, adminSelectedSession) === adminSelectedLevel
                    );
                    const displayStudents = rosterStudents.length > 0 ? rosterStudents : students;

                    return displayStudents.map((student) => {
                      const { ca, exam } = getExistingScore(student.id, selectedCourse.id);
                      return (
                        <ScoreRow
                          key={student.id}
                          student={{ id: student.id, matricNo: student.matricNo }}
                          courseId={selectedCourse.id}
                          existingCA={ca}
                          existingExam={exam}
                          level={adminSelectedLevel}
                          semester={adminSelectedSemester}
                          session={adminSelectedSession}
                        />
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-uch-border/40 bg-uch-surface/70 flex gap-3">
        <button
          id="save-draft-btn"
          onClick={saveDraft}
          className="uch-btn-secondary flex-1 flex items-center justify-center gap-2 h-11 text-sm"
        >
          <Save size={16} />
          Save Draft
        </button>
        <button
          id="publish-results-btn"
          onClick={handlePublish}
          disabled={publishing}
          className="uch-btn-gold flex-1 flex items-center justify-center gap-2 h-11 text-sm"
        >
          {publishing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Rocket size={16} />
              Publish Results
            </>
          )}
        </button>
      </div>

      {/* Course Curriculum Drawer */}
      {showCurriculum && (
        <CourseCurriculumDrawer onClose={() => setShowCurriculum(false)} />
      )}

      {/* Academic Policy Modal */}
      {showPolicyModal && (
        <AcademicPolicyModal onClose={() => setShowPolicyModal(false)} />
      )}
    </div>
  );
}
