'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { CardSkeletonLoader } from '../../../components/SkeletonLoader';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Institutional Regulations Engine
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Academic Regulations & Grading Rules
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              School of Nursing, UCH | System rules governance for automated grading and GP computation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPolicies()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
              type="button"
            >
              Refresh Policies
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded text-xs font-semibold border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* System Grading Rules Indicator Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Grading Scale</p>
            <p className="text-base font-bold text-slate-900">5.00 Maximum Point Scale</p>
            <p className="text-xs text-emerald-800 font-semibold">NMCN Standard Benchmark</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Course Pass Mark</p>
            <p className="text-base font-bold text-emerald-900">50% Minimum (C = 3.0 GP)</p>
            <p className="text-xs text-slate-500 font-medium">CA (30) + Exam (70)</p>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Academic Probation</p>
            <p className="text-base font-bold text-amber-900">&lt; 1.50 CGPA</p>
            <p className="text-xs text-amber-800 font-semibold">Automatic Review by Board</p>
          </div>
        </div>

        {/* Main Grid: Create Policy & Published List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Publish Policy Form */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Publish New Policy Rule
              </h2>
              <p className="text-xs text-slate-500">Add institutional rules to student portal</p>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5-Point CGPA Grading Scheme & Classification"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Grading & CGPA">Grading & CGPA</option>
                  <option value="Examination Conduct">Examination Conduct</option>
                  <option value="Probation & Withdrawal">Probation & Withdrawal</option>
                  <option value="Clinical & Ward Regulations">Clinical & Ward Regulations</option>
                  <option value="General Academic Rules">General Academic Rules</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Content / Regulations Text
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Specify regulations, formulas, minimum attendance requirements, or evaluation criteria..."
                  required
                  rows={6}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 leading-relaxed focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded text-xs transition-colors"
              >
                {saving ? 'Publishing…' : 'Publish Academic Policy'}
              </button>
            </form>
          </div>

          {/* Existing Policy List with Edit & Delete */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Published Policies & Rules ({policies.length})
              </h2>
              <span className="text-xs text-slate-500 font-medium">Live on Student Portals</span>
            </div>

            {loading ? (
              <CardSkeletonLoader count={2} />
            ) : policies.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
                <p className="font-semibold text-slate-700">No policies published yet.</p>
                <p className="text-slate-400">Use the form on the left to publish institutional regulations and guidelines.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {policies.map((p) => (
                  <article key={p.id} className="p-5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{p.title}</span>
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold rounded">
                          {p.category}
                        </span>
                      </div>

                      {/* Action Buttons: Edit & Delete */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(p.id)}
                          disabled={deletingId === p.id}
                          className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-700 text-xs font-semibold rounded border border-red-200 transition-colors disabled:opacity-50"
                          type="button"
                        >
                          {deletingId === p.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{p.content}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>Last updated: {new Date(p.updatedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="text-emerald-800 font-semibold">Active in System</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Policy Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="w-full max-w-lg bg-white rounded-lg border border-slate-300 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Edit Academic Policy Rule
              </h3>
              <button
                onClick={() => setEditingPolicy(null)}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold"
                type="button"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Grading & CGPA">Grading & CGPA</option>
                  <option value="Examination Conduct">Examination Conduct</option>
                  <option value="Probation & Withdrawal">Probation & Withdrawal</option>
                  <option value="Clinical & Ward Regulations">Clinical & Ward Regulations</option>
                  <option value="General Academic Rules">General Academic Rules</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Policy Content / Regulations Text
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  rows={7}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 leading-relaxed focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  disabled={editSubmitting}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded"
                >
                  {editSubmitting ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
