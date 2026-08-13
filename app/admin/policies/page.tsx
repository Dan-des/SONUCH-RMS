'use client';

import React, { useState, useEffect } from 'react';

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Grading & CGPA');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800">Academic Policy CMS Manager</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Publish, update, and manage institutional regulations, grading systems, pass marks, and academic conduct rules.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publish Policy Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Publish New Academic Policy</h2>
          <form onSubmit={handleCreatePolicy} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Policy Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5-Point CGPA Grading Scheme & Classification"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
              >
                <option value="Grading & CGPA">Grading & CGPA</option>
                <option value="Examination Conduct">Examination Conduct</option>
                <option value="Probation & Withdrawal">Probation & Withdrawal</option>
                <option value="Clinical & Ward Regulations">Clinical & Ward Regulations</option>
                <option value="General Academic Rules">General Academic Rules</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Policy Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write policy details in full text or markdown formatting..."
                required
                rows={6}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {saving ? 'Publishing…' : 'Publish Academic Policy'}
            </button>
          </form>
        </div>

        {/* Existing Policy List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Published Policies ({policies.length})</h2>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading policy articles…</div>
          ) : policies.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No policies published yet. Use the form to publish institutional regulations.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {policies.map((p) => (
                <div key={p.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">{p.title}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-1">{p.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
