import { useState } from 'react';
import {
  Download,
  X,
  Users,
  Search,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { calculateCurrentLevel } from '../../../types';
import type { Level } from '../../../types';

interface RosterExportModalProps {
  onClose: () => void;
}

const ALL_LEVELS: Level[] = ['100L', '200L', '300L', '400L', '500L'];

export function RosterExportModal({ onClose }: RosterExportModalProps) {
  const { students, activeSystemSession, academicPolicy } = useAppStore();

  const [selectedLevel, setSelectedLevel] = useState<Level | 'all'>('all');
  const [search, setSearch] = useState('');

  const maxLevelIdx = ALL_LEVELS.indexOf(academicPolicy.maxSystemLevel || '500L');
  const availableLevels = ALL_LEVELS.slice(0, maxLevelIdx + 1);

  const filteredStudents = students.filter((s) => {
    const currentCalcLevel = calculateCurrentLevel(s.entrySession, activeSystemSession);
    const matchesLevel = selectedLevel === 'all' || currentCalcLevel === selectedLevel;
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.matricNo.toLowerCase().includes(search.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
      (s.stateOfOrigin && s.stateOfOrigin.toLowerCase().includes(search.toLowerCase()));

    return matchesLevel && matchesSearch;
  });

  const exportCSV = () => {
    if (filteredStudents.length === 0) return;

    const headers = [
      'Matriculation No',
      'Full Name',
      'Entry Session',
      'Current Level',
      'Gender',
      'Email',
      'Phone',
      'Date of Birth',
      'State of Origin',
      'LGA',
      'Nationality',
    ];

    const rows = filteredStudents.map((s) => [
      `"${s.matricNo}"`,
      `"${s.fullName}"`,
      `"${s.entrySession}"`,
      `"${calculateCurrentLevel(s.entrySession, activeSystemSession)}"`,
      `"${s.gender || 'Female'}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${s.dateOfBirth || ''}"`,
      `"${s.stateOfOrigin || ''}"`,
      `"${s.lga || ''}"`,
      `"${s.nationality || 'Nigerian'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SON_UCH_Student_Directory_${selectedLevel}_${activeSystemSession.replace('/', '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl bg-uch-surface border border-uch-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-100 dark:border-uch-border bg-emerald-50/80 dark:bg-uch-card flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Student Directory &amp; Roster Export</h3>
              <p className="text-slate-600 dark:text-uch-muted text-xs">Joined Academic &amp; Student-Submitted Profile Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white dark:bg-uch-surface flex items-center justify-center text-slate-500 dark:text-uch-muted hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-uch-border"
          >
            <X size={16} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-uch-border/40 bg-slate-50 dark:bg-uch-card/50 flex items-center justify-between gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-uch-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, matric, state, or email…"
              className="uch-input pl-9 py-1.5 text-xs bg-white dark:bg-uch-surface"
            />
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 dark:text-uch-muted" />
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as Level | 'all')}
              className="uch-select text-xs py-1.5 px-3 font-semibold bg-white dark:bg-uch-surface"
            >
              <option value="all">All Levels ({availableLevels.join(', ')})</option>
              {availableLevels.map((l) => (
                <option key={l} value={l}>{l} Level</option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={exportCSV}
            disabled={filteredStudents.length === 0}
            className="uch-btn-gold text-xs py-1.5 px-4 flex items-center gap-1.5 font-bold shadow-md disabled:opacity-40"
          >
            <Download size={14} />
            Export Roster CSV ({filteredStudents.length})
          </button>
        </div>

        {/* Directory Table */}
        <div className="flex-1 overflow-auto p-4 bg-white dark:bg-uch-surface">
          {filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-500 dark:text-uch-muted space-y-2">
              <Users size={40} className="mx-auto opacity-30" />
              <p className="font-semibold text-sm">No student records found</p>
              <p className="text-xs opacity-60">Enroll students or try a different filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-uch-border/40">
              <table className="w-full text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-uch-card border-b border-slate-200 dark:border-uch-border text-slate-700 dark:text-uch-muted font-bold text-left">
                    <th className="py-3 px-3">Matric No.</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Level / Session</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3">Profile Data (State / LGA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-uch-border/20 text-slate-900 dark:text-white">
                  {filteredStudents.map((student) => {
                    const currentLevel = calculateCurrentLevel(student.entrySession, activeSystemSession);
                    return (
                      <tr key={student.id} className="hover:bg-orange-50 dark:hover:bg-uch-card/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {student.matricNo}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                          {student.fullName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-uch-accent/15 border border-emerald-300 dark:border-uch-accent/30 text-emerald-700 dark:text-uch-accent font-bold">
                            {currentLevel}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-uch-muted ml-2">Entry: {student.entrySession}</span>
                        </td>
                        <td className="py-2.5 px-3 text-uch-muted">
                          <p className="text-uch-fg">{student.email || 'No email'}</p>
                          <p className="text-[11px]">{student.phone || 'No phone'}</p>
                        </td>
                        <td className="py-2.5 px-3 text-uch-muted">
                          <p>{student.stateOfOrigin || 'Unspecified'} {student.lga ? `(${student.lga})` : ''}</p>
                          <p className="text-[11px] opacity-70">{student.nationality || 'Nigerian'} · {student.gender}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
