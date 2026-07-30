import { useState } from 'react';
import {
  Search,
  UserPlus,
  RotateCcw,
  Trash2,
  ChevronLeft,
  Users,
  X,
  Check,
  AlertTriangle,
  Pencil,
  Lock,
  Filter,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { calculateCurrentLevel, ALL_SESSIONS, generateDynamicSessions } from '../../types';
import type { Student } from '../../types';

export function StudentRoster() {
  const {
    students,
    addStudent,
    updateStudentAdmin,
    resetStudentPin,
    deleteStudent,
    setAdminView,
    activeSystemSession,
    academicPolicy,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add student form state
  const [newSurname, setNewSurname] = useState('');
  const [newOtherNames, setNewOtherNames] = useState('');
  const [newSequenceNo, setNewSequenceNo] = useState('');
  const [newEntrySession, setNewEntrySession] = useState(activeSystemSession);

  // Edit student form state
  const [editSurname, setEditSurname] = useState('');
  const [editOtherNames, setEditOtherNames] = useState('');
  const [editEntrySession, setEditEntrySession] = useState('');

  const prefix = academicPolicy.matricPrefix || 'UI/SONUCH/UTME/';
  const fullMatricPreview = `${prefix}${newSequenceNo.trim()}`;
  const computedStartLevel = calculateCurrentLevel(newEntrySession, activeSystemSession);

  const filtered = students
    .filter((s) => {
      const currentCalcLevel = calculateCurrentLevel(s.entrySession, activeSystemSession);
      const matchesLevel =
        selectedLevelFilter === 'all' || currentCalcLevel === selectedLevelFilter;

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        s.fullName.toLowerCase().includes(query) ||
        s.matricNo.toLowerCase().includes(query) ||
        (s.entrySession && s.entrySession.includes(query));

      return matchesLevel && matchesSearch;
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSequenceNo.trim() || !newSurname.trim() || !newOtherNames.trim()) return;

    if (students.some((s) => s.matricNo.toLowerCase() === fullMatricPreview.toLowerCase())) {
      return;
    }

    addStudent({
      sequenceNo: newSequenceNo.trim(),
      surname: newSurname.trim(),
      otherNames: newOtherNames.trim(),
      entrySession: newEntrySession,
    });

    setNewSurname('');
    setNewOtherNames('');
    setNewSequenceNo('');
    setNewEntrySession(activeSystemSession);
    setShowAddModal(false);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setEditSurname(student.surname || student.lastName || student.fullName.split(' ')[0] || '');
    setEditOtherNames(student.otherNames || student.firstName || student.fullName.split(' ').slice(1).join(' ') || '');
    setEditEntrySession(student.entrySession || activeSystemSession);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editSurname.trim() || !editOtherNames.trim()) return;

    updateStudentAdmin(editingStudent.id, {
      surname: editSurname.trim(),
      otherNames: editOtherNames.trim(),
      entrySession: editEntrySession,
    });

    setEditingStudent(null);
  };

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      deleteStudent(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-fade-in max-w-5xl mx-auto w-full">
      {/* Sub-header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-uch-border/40 bg-slate-50 dark:bg-uch-surface/50">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setAdminView('hub')}
            className="w-8 h-8 rounded-xl bg-white dark:bg-uch-surface flex items-center justify-center text-slate-500 dark:text-uch-muted hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-uch-border transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Student Roster Directory</h2>
            <p className="text-slate-500 dark:text-uch-muted text-xs">{filtered.length} of {students.length} enrolled students (A–Z)</p>
          </div>
          <button
            id="add-student-btn"
            onClick={() => setShowAddModal(true)}
            className="ml-auto flex items-center gap-1.5 uch-btn-primary text-xs py-2 px-3.5 shadow-md font-semibold"
          >
            <UserPlus size={14} />
            Enroll Student
          </button>
        </div>

        {/* Controls Bar: Search & Level Filter */}
        <div className="flex gap-2 flex-wrap items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-uch-muted" />
            <input
              id="roster-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, matric number, or session…"
              className="uch-input pl-10 text-sm bg-white dark:bg-uch-surface"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-uch-muted hover:opacity-80"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-orange-500 hidden sm:inline" />
            <select
              id="roster-level-filter"
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="uch-select py-2 text-xs font-semibold bg-white dark:bg-uch-surface border border-slate-200 dark:border-uch-border"
              style={{ minWidth: 120 }}
            >
              <option value="all">All Levels</option>
              <option value="100L">100L</option>
              <option value="200L">200L</option>
              <option value="300L">300L</option>
              <option value="400L">400L</option>
              <option value="500L">500L</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-uch-muted glass-card border-dashed">
            <Users size={44} className="mb-3 opacity-30 text-teal-500" />
            <p className="font-bold text-base text-slate-900 dark:text-white">No Enrolled Students</p>
            <p className="text-xs max-w-sm text-center opacity-70 mt-1">
              {search
                ? 'No students matched your search criteria.'
                : 'Click "Enroll Student" above to register students into the system directory.'}
            </p>
            {!search && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 uch-btn-gold text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-md"
              >
                <UserPlus size={14} />
                Enroll First Student
              </button>
            )}
          </div>
        ) : (
          filtered.map((student) => (
            <div
              key={student.id}
              className="glass-card p-4 flex items-center gap-3 bg-white dark:bg-uch-card border border-slate-200 dark:border-uch-border shadow-sm hover:border-orange-300 dark:hover:border-uch-border transition-all"
            >
              {/* Avatar */}
              {student.avatarUrl ? (
                <img
                  src={student.avatarUrl}
                  alt={student.fullName}
                  className="w-10 h-10 rounded-full object-cover shadow flex-shrink-0 border border-teal-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0 badge-fill">
                  {student.avatarInitials}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">{student.fullName}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">{student.matricNo}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-uch-accent/10 border border-emerald-300 dark:border-uch-accent/20 text-emerald-700 dark:text-uch-accent text-xs font-medium">
                    {calculateCurrentLevel(student.entrySession, activeSystemSession)} ({activeSystemSession})
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-uch-muted">
                    Entry: {student.entrySession}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Edit Student */}
                <button
                  id={`edit-student-${student.id}`}
                  onClick={() => handleOpenEdit(student)}
                  title="Edit student record"
                  className="w-8 h-8 rounded-lg bg-uch-surface border border-uch-border hover:bg-orange-50 hover:border-orange-300 dark:hover:border-teal-500/50 flex items-center justify-center text-uch-muted hover:text-orange-600 dark:hover:text-teal-400 transition-all"
                >
                  <Pencil size={13} />
                </button>

                {/* Reset PIN */}
                <button
                  id={`reset-pin-${student.id}`}
                  onClick={() => resetStudentPin(student.id)}
                  title="Reset PIN to default (12345)"
                  className="w-8 h-8 rounded-lg bg-uch-surface border border-uch-border hover:bg-orange-50 hover:border-orange-300 dark:hover:border-uch-accent/50 flex items-center justify-center text-uch-muted hover:text-orange-600 dark:hover:text-uch-accent transition-all"
                >
                  <RotateCcw size={13} />
                </button>

                {/* Delete */}
                <button
                  id={`delete-${student.id}`}
                  onClick={() => handleDelete(student.id)}
                  title={confirmDeleteId === student.id ? 'Click again to confirm deletion' : 'Delete student'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    confirmDeleteId === student.id
                      ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                      : 'bg-uch-surface border border-uch-border text-uch-muted hover:text-red-400 hover:border-red-500/40'
                  }`}
                >
                  {confirmDeleteId === student.id ? (
                    <AlertTriangle size={13} />
                  ) : (
                    <Trash2 size={13} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-uch-surface border border-slate-200 dark:border-uch-border rounded-2xl p-6 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus size={18} className="text-orange-500" />
                <h3 className="font-bold text-slate-900 dark:text-white">Enroll New Student</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-uch-surface flex items-center justify-center text-slate-500 dark:text-uch-muted hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-uch-border"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="new-surname" className="uch-label">Surname (Family Name)</label>
                <input
                  id="new-surname"
                  type="text"
                  value={newSurname}
                  onChange={(e) => setNewSurname(e.target.value)}
                  placeholder="e.g. Surname"
                  className="uch-input text-xs"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-othernames" className="uch-label">Other Names (First &amp; Middle Name)</label>
                <input
                  id="new-othernames"
                  type="text"
                  value={newOtherNames}
                  onChange={(e) => setNewOtherNames(e.target.value)}
                  placeholder="e.g. First &amp; Middle Name"
                  className="uch-input text-xs"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-sequence" className="uch-label">Sequence Number</label>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-mono px-2.5 py-2 rounded-xl bg-uch-surface border border-uch-border text-uch-muted font-bold flex-shrink-0">
                    {prefix}
                  </span>
                  <input
                    id="new-sequence"
                    type="text"
                    value={newSequenceNo}
                    onChange={(e) => setNewSequenceNo(e.target.value.replace(/\s+/g, ''))}
                    placeholder="001"
                    className="uch-input font-mono text-xs flex-1"
                    required
                  />
                </div>
                {/* Live Preview */}
                <p className="text-[11px] text-uch-muted mt-1.5">
                  Assigned Matric Number:{' '}
                  <strong className="text-teal-600 dark:text-teal-400 font-mono">{`${prefix}${newSequenceNo.trim() || '000'}`}</strong>
                </p>
                {students.some((s) => s.matricNo.toLowerCase() === fullMatricPreview.toLowerCase()) && newSequenceNo && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={11} /> Matric number already exists
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="entry-session" className="uch-label">Admission Entry Session</label>
                <select
                  id="entry-session"
                  value={newEntrySession}
                  onChange={(e) => setNewEntrySession(e.target.value)}
                  className="uch-select text-xs font-bold"
                >
                  {generateDynamicSessions(students.map((s) => s.entrySession)).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="mt-2 p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] flex items-center justify-between">
                  <span className="text-uch-muted">Computed Relative Level:</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold">
                    {computedStartLevel} ({activeSystemSession})
                  </span>
                </div>
              </div>

              <p className="text-xs text-uch-muted">
                Initial Security PIN:{' '}
                <span className="font-mono font-bold" style={{ color: 'var(--uch-fg)' }}>
                  Generated automatically (Default: 12345)
                </span>
              </p>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="uch-btn-secondary flex-1 text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newSequenceNo.trim() || !newSurname.trim() || !newOtherNames.trim() || students.some((s) => s.matricNo.toLowerCase() === fullMatricPreview.toLowerCase())}
                  className="uch-btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs"
                >
                  <Check size={15} />
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-uch-surface border border-slate-200 dark:border-uch-border rounded-2xl p-6 shadow-2xl animate-slide-up space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pencil size={18} className="text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-white">Edit Student Record</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-uch-surface flex items-center justify-center text-slate-500 dark:text-uch-muted hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-uch-border"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="uch-label">Matriculation Number (Read Only)</label>
                <input
                  type="text"
                  value={editingStudent.matricNo}
                  disabled
                  className="uch-input font-mono text-xs opacity-60 bg-uch-surface cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="edit-surname" className="uch-label">Surname (Family Name)</label>
                <input
                  id="edit-surname"
                  type="text"
                  value={editSurname}
                  onChange={(e) => setEditSurname(e.target.value)}
                  className="uch-input text-xs"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-othernames" className="uch-label">Other Names (First &amp; Middle Name)</label>
                <input
                  id="edit-othernames"
                  type="text"
                  value={editOtherNames}
                  onChange={(e) => setEditOtherNames(e.target.value)}
                  className="uch-input text-xs"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-entry-session" className="uch-label">Admission Entry Session</label>
                <select
                  id="edit-entry-session"
                  value={editEntrySession}
                  onChange={(e) => setEditEntrySession(e.target.value)}
                  className="uch-select text-xs font-bold"
                >
                  {generateDynamicSessions(students.map((s) => s.entrySession)).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Hard-Locked Security PIN Field */}
              <div>
                <label className="uch-label flex items-center gap-1.5 text-amber-400">
                  <Lock size={12} />
                  Security PIN (Locked / Protection Active)
                </label>
                <input
                  type="password"
                  value="••••••••"
                  disabled
                  readOnly
                  className="uch-input text-xs opacity-50 bg-uch-surface cursor-not-allowed border-amber-500/30"
                />
                <p className="text-[10px] text-uch-muted mt-1">
                  PIN is locked to preserve student modifications. Use <strong className="text-uch-gold">Reset PIN</strong> to revert to 12345.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditingStudent(null)} className="uch-btn-secondary flex-1 text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!editSurname.trim() || !editOtherNames.trim()}
                  className="uch-btn-gold flex-1 flex items-center justify-center gap-1.5 text-xs font-bold"
                >
                  <Check size={15} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
