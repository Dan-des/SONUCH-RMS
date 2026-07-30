import { useState } from 'react';
import {
  Sliders,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Save,
  BookOpen,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { UCH_DEFAULT_GRADE_BOUNDARIES } from '../../../types';
import type { GradeBoundary, AcademicPolicy, Level } from '../../../types';

interface AcademicPolicyModalProps {
  onClose: () => void;
}

export function AcademicPolicyModal({ onClose }: AcademicPolicyModalProps) {
  const { academicPolicy, updateAcademicPolicy, adminAccessKey, updateAdminKey } = useAppStore();

  const [maxCA, setMaxCA] = useState<number>(academicPolicy.maxCA);
  const [maxExam, setMaxExam] = useState<number>(academicPolicy.maxExam);
  const [matricPrefix, setMatricPrefix] = useState<string>(academicPolicy.matricPrefix || 'UI/SONUCH/UTME/');
  const [maxSystemLevel, setMaxSystemLevel] = useState<Level>(academicPolicy.maxSystemLevel || '500L');
  const [adminKeyInput, setAdminKeyInput] = useState<string>(adminAccessKey || 'UCH-ADMIN-2026-KEY');
  const [boundaries, setBoundaries] = useState<GradeBoundary[]>(
    academicPolicy.gradeBoundaries.length > 0
      ? academicPolicy.gradeBoundaries
      : []
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const totalWeight = (maxCA || 0) + (maxExam || 0);

  // New Grade Boundary form state
  const [newGrade, setNewGrade] = useState('');
  const [newMin, setNewMin] = useState('');
  const [newMax, setNewMax] = useState('');
  const [newGP, setNewGP] = useState('');
  const [newRemark, setNewRemark] = useState('');

  const handleSaveAdminKey = () => {
    if (!adminKeyInput.trim()) return;
    updateAdminKey(adminKeyInput.trim());
  };

  const handleApplyPreset = () => {
    setMaxCA(30);
    setMaxExam(70);
    setMatricPrefix('UI/SONUCH/UTME/');
    setMaxSystemLevel('500L');
    setBoundaries(UCH_DEFAULT_GRADE_BOUNDARIES);
    setErrorMsg(null);
  };

  const handleAddBoundary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGrade.trim() || newMin === '' || newMax === '' || newGP === '') return;

    const newRow: GradeBoundary = {
      id: `gb-${Date.now()}`,
      grade: newGrade.trim().toUpperCase(),
      minScore: Number(newMin),
      maxScore: Number(newMax),
      gradePoint: Number(newGP),
      remark: newRemark.trim() || 'Pass',
    };

    setBoundaries([...boundaries, newRow]);
    setNewGrade('');
    setNewMin('');
    setNewMax('');
    setNewGP('');
    setNewRemark('');
  };

  const handleDeleteBoundary = (id: string) => {
    setBoundaries(boundaries.filter((b) => b.id !== id));
  };

  const handleSave = () => {
    if (totalWeight !== 100) {
      setErrorMsg(`Assessment Ratios must sum to exactly 100% (Current Total: ${totalWeight}%).`);
      return;
    }

    if (!matricPrefix.trim()) {
      setErrorMsg('Please specify a Matriculation Number Prefix.');
      return;
    }

    if (boundaries.length === 0) {
      setErrorMsg('Please define at least one Grade Scale Boundary.');
      return;
    }

    const newPolicy: AcademicPolicy = {
      maxCA,
      maxExam,
      isConfigured: true,
      gradeBoundaries: boundaries,
      matricPrefix: matricPrefix.trim(),
      maxSystemLevel,
    };

    updateAcademicPolicy(newPolicy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-uch-surface border border-uch-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-emerald-100 dark:border-uch-border bg-emerald-50/80 dark:bg-uch-card flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: 'var(--uch-fg)' }}>Academic Policy &amp; Grading Configurator</h3>
              <p className="text-slate-600 dark:text-uch-muted text-xs">Define institutional assessment weights &amp; grade boundaries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyPreset}
              className="flex items-center gap-1.5 uch-btn-secondary text-xs py-1.5 px-3 font-semibold"
              title="Apply SONUCH institutional defaults"
            >
              <Sparkles size={13} className="text-amber-400" />
              SONUCH Standard Preset
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-uch-surface flex items-center justify-center text-uch-muted hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 text-xs flex items-start gap-2 font-medium">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Institutional Setup Section */}
          <div className="bg-slate-50 dark:bg-uch-card border border-slate-200 dark:border-uch-border p-5 space-y-4 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <BookOpen size={16} className="text-teal-600 dark:text-teal-400" />
              Institutional Identification &amp; Level Bounds
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="uch-label">Matriculation Prefix</label>
                <input
                  type="text"
                  value={matricPrefix}
                  onChange={(e) => setMatricPrefix(e.target.value)}
                  placeholder="e.g. UI/SONUCH/UTME/"
                  className="uch-input font-mono text-xs bg-white dark:bg-uch-surface"
                  required
                />
                <p className="text-[10px] text-slate-500 dark:text-uch-muted mt-1">Live preview: <strong className="text-teal-600 dark:text-teal-400 font-mono">{matricPrefix}</strong></p>
              </div>
              <div>
                <label className="uch-label">Maximum System Level</label>
                <select
                  value={maxSystemLevel}
                  onChange={(e) => setMaxSystemLevel(e.target.value as Level)}
                  className="uch-select text-xs font-bold bg-white dark:bg-uch-surface"
                >
                  <option value="300L">300 Level (3-Year Programme)</option>
                  <option value="400L">400 Level (4-Year Programme)</option>
                  <option value="500L">500 Level (5-Year Programme)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Admin Security Access Key */}
          <div className="bg-slate-50 dark:bg-uch-card border border-slate-200 dark:border-uch-border p-5 space-y-4 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck size={16} className="text-amber-500" />
              Admin Portal Security Access Key
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="uch-label">Active Admin Access Key</label>
                <input
                  type="text"
                  value={adminKeyInput}
                  onChange={(e) => setAdminKeyInput(e.target.value)}
                  placeholder="e.g. UCH-ADMIN-2026-KEY"
                  className="uch-input font-mono text-xs bg-white dark:bg-uch-surface"
                  required
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleSaveAdminKey}
                  className="uch-btn-primary text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-1.5 w-full"
                >
                  <Key size={14} /> Update Access Key
                </button>
              </div>
            </div>
          </div>

          {/* Section 1: Assessment Ratios */}
          <div className="bg-slate-50 dark:bg-uch-card border border-slate-200 dark:border-uch-border p-5 space-y-4 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <Sliders size={16} className="text-orange-500" />
                Assessment Ratios (Max Weights)
              </h4>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  totalWeight === 100
                    ? 'bg-emerald-100 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                    : 'bg-amber-100 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
                }`}
              >
                Total: {totalWeight}% {totalWeight === 100 ? '✓' : '(Must be 100%)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="uch-label">Continuous Assessment (CA) Max Weight</label>
                <div className="relative">
                  <input
                    type="number"
                    value={maxCA || ''}
                    onChange={(e) => setMaxCA(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    min={0}
                    max={100}
                    className="uch-input font-bold text-sm bg-white dark:bg-uch-surface"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-uch-muted font-bold">%</span>
                </div>
              </div>
              <div>
                <label className="uch-label">Semester Exam Max Weight</label>
                <div className="relative">
                  <input
                    type="number"
                    value={maxExam || ''}
                    onChange={(e) => setMaxExam(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    min={0}
                    max={100}
                    className="uch-input font-bold text-sm bg-white dark:bg-uch-surface"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-uch-muted font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Dynamic Grade Scale */}
          <div className="bg-slate-50 dark:bg-uch-card border border-slate-200 dark:border-uch-border p-5 space-y-4 rounded-2xl shadow-sm">
            <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <CheckCircle2 size={16} className="text-orange-500" />
              Dynamic Grade Boundaries &amp; Remarks
            </h4>

            {/* Add boundary form */}
            <form onSubmit={handleAddBoundary} className="grid grid-cols-5 gap-2 items-end bg-white dark:bg-uch-surface p-3 rounded-xl border border-slate-200 dark:border-uch-border/50">
              <div>
                <label className="uch-label text-[10px]">Grade</label>
                <input
                  type="text"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  placeholder="e.g. A"
                  className="uch-input text-xs uppercase"
                  required
                />
              </div>
              <div>
                <label className="uch-label text-[10px]">Min Score</label>
                <input
                  type="number"
                  value={newMin}
                  onChange={(e) => setNewMin(e.target.value)}
                  placeholder="70"
                  className="uch-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="uch-label text-[10px]">Max Score</label>
                <input
                  type="number"
                  value={newMax}
                  onChange={(e) => setNewMax(e.target.value)}
                  placeholder="100"
                  className="uch-input text-xs"
                  required
                />
              </div>
              <div>
                <label className="uch-label text-[10px]">Grade Point</label>
                <input
                  type="number"
                  step="0.1"
                  value={newGP}
                  onChange={(e) => setNewGP(e.target.value)}
                  placeholder="5.0"
                  className="uch-input text-xs"
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full uch-btn-primary text-xs py-2 flex items-center justify-center gap-1"
                >
                  <Plus size={13} /> Add
                </button>
              </div>
            </form>

            {/* Table */}
            {boundaries.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 dark:border-uch-border rounded-xl text-slate-500 dark:text-uch-muted">
                <p className="text-xs">No grade boundaries defined yet.</p>
                <p className="text-[11px] mt-1 opacity-60">Click "SONUCH Standard Preset" above or add custom boundaries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-uch-border/40">
                <table className="w-full text-xs min-w-[450px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-uch-card border-b border-slate-200 dark:border-uch-border text-slate-700 dark:text-uch-muted font-bold text-left">
                      <th className="py-2.5 px-3">Grade</th>
                      <th className="py-2.5 px-3">Range</th>
                      <th className="py-2.5 px-3">Grade Point</th>
                      <th className="py-2.5 px-3">Remark</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-uch-border/20 text-slate-900 dark:text-white">
                    {boundaries.map((b) => (
                      <tr key={b.id} className="hover:bg-orange-50 dark:hover:bg-uch-card/40">
                        <td className="py-2 px-3 font-bold text-orange-600 dark:text-orange-400">{b.grade}</td>
                        <td className="py-2 px-3">{b.minScore} – {b.maxScore} marks</td>
                        <td className="py-2 px-3 font-mono">{b.gradePoint.toFixed(1)}</td>
                        <td className="py-2 px-3 text-slate-600 dark:text-uch-muted">{b.remark}</td>
                        <td className="py-2 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteBoundary(b.id)}
                            className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-uch-border bg-slate-50 dark:bg-uch-surface flex items-center justify-between flex-shrink-0">
          <button type="button" onClick={onClose} className="uch-btn-secondary text-xs py-2 px-4">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="uch-btn-gold text-xs py-2 px-5 flex items-center gap-2 font-bold shadow-lg"
          >
            <Save size={15} />
            Save Academic Policy
          </button>
        </div>
      </div>
    </div>
  );
}
