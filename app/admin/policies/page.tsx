'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  PlusCircle,
  FileText,
  Layers,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Sliders,
  Scale,
  ShieldAlert,
  Save,
  X,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';

interface GradingRule {
  minScore: number;
  maxScore: number;
  letterGrade: string;
  gradePoint: number;
  description: string;
}

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Grading & CGPA');
  const [content, setContent] = useState('');

  // Edit Modal State
  const [editingPolicy, setEditingPolicy] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Grading & CGPA');
  const [editContent, setEditContent] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/policies?includeArchived=true');
      const data = await res.json();
      if (res.ok) {
        setPolicies(data.policies || []);
      }
    } catch (err) {
      console.error('Failed to fetch policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, content }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish policy');
      }

      setMessage({ type: 'success', text: data.message });
      setTitle('');
      setContent('');
      fetchPolicies();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEditModal = (policy: any) => {
    setEditingPolicy(policy);
    setEditTitle(policy.title);
    setEditCategory(policy.category);
    setEditContent(policy.content);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPolicy) return;
    setEditSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/policies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPolicy.id,
          title: editTitle,
          category: editCategory,
          content: editContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update policy');
      }

      setMessage({ type: 'success', text: data.message });
      setEditingPolicy(null);
      fetchPolicies();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!confirm('Are you sure you want to delete this academic policy rule? This action is permanent.')) {
      return;
    }

    setDeletingId(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/policies?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete policy');
      }

      setMessage({ type: 'success', text: data.message });
      fetchPolicies();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        pageTitle="Academic Policy & Grading Rules Engine"
        pageSubtitle="Manage institutional grading formulas, minimum pass marks (50%), probation thresholds, and publish or edit academic policies."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Academic Regulations & Grading Rules Engine</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                School of Nursing, UCH • Real-time system rules governance for automated grading and GP computation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchPolicies()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
              title="Refresh Policies"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-800' : ''}`} />
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* System Grading Rules Indicator Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="p-3 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">System Grading Scale</p>
              <p className="text-base font-black text-slate-900">5.00 Maximum Point Scale</p>
              <p className="text-[11px] text-teal-700 font-bold">NMCN Standard Benchmark</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Course Pass Mark</p>
              <p className="text-base font-black text-emerald-800">50% Minimum (C = 3.0 GP)</p>
              <p className="text-[11px] text-slate-500 font-medium">CA (30) + Exam (70)</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Academic Probation</p>
              <p className="text-base font-black text-amber-900">&lt; 1.50 CGPA</p>
              <p className="text-[11px] text-amber-700 font-bold">Automatic Review by Board</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Create Policy & Published List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Publish Policy Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-teal-800" />
              <span>Publish New Policy Rule</span>
            </h3>
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5-Point CGPA Grading Scheme & Classification"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                >
                  <option value="Grading & CGPA">Grading & CGPA</option>
                  <option value="Examination Conduct">Examination Conduct</option>
                  <option value="Probation & Withdrawal">Probation & Withdrawal</option>
                  <option value="Clinical & Ward Regulations">Clinical & Ward Regulations</option>
                  <option value="General Academic Rules">General Academic Rules</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Content / Regulations Text
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Specify regulations, formulas, minimum attendance requirements, or evaluation criteria..."
                  required
                  rows={6}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-700 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{saving ? 'Publishing…' : 'Publish Academic Policy'}</span>
              </button>
            </form>
          </div>

          {/* Existing Policy List with Edit & Delete */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-800" />
                <span>Published Policies & Rules ({policies.length})</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">Live on Student Portals</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading policy articles…</div>
            ) : policies.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
                <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-600">No policies published yet.</p>
                <p className="text-[11px] text-slate-400">Use the form to publish institutional regulations and guidelines.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {policies.map((p) => (
                  <div key={p.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 transition-all hover:border-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{p.title}</span>
                        <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-bold rounded-full">
                          {p.category}
                        </span>
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-2xs flex items-center gap-1 transition-colors"
                          title="Edit Policy"
                        >
                          <Edit2 className="w-3 h-3 text-teal-800" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(p.id)}
                          disabled={deletingId === p.id}
                          className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-200 shadow-2xs flex items-center gap-1 transition-colors disabled:opacity-50"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{deletingId === p.id ? 'Deleting…' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{p.content}</p>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span>Last updated: {new Date(p.updatedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-emerald-700 font-bold">Active in System</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 md:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-800" />
                <span>Edit Academic Policy Rule</span>
              </h3>
              <button
                onClick={() => setEditingPolicy(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                >
                  <option value="Grading & CGPA">Grading & CGPA</option>
                  <option value="Examination Conduct">Examination Conduct</option>
                  <option value="Probation & Withdrawal">Probation & Withdrawal</option>
                  <option value="Clinical & Ward Regulations">Clinical & Ward Regulations</option>
                  <option value="General Academic Rules">General Academic Rules</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Content / Regulations Text
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  rows={7}
                  className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-700 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editSubmitting ? 'Saving Changes…' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
