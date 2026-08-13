'use client';

import React, { useState, useEffect } from 'react';

export default function StudentPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, [search, category]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('q', search);
      if (category) query.append('category', category);

      const res = await fetch(`/api/policies?${query.toString()}`);
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800">Academic Policy & Regulations Guide</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          School of Nursing, UCH Ibadan — Official Handbook, Grading Schemes, Pass Marks, and Examination Conduct.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academic regulations, grading formulas, probation rules…"
            className="w-full pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-56 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
        >
          <option value="">All Policy Categories</option>
          <option value="Grading & CGPA">Grading & CGPA</option>
          <option value="Examination Conduct">Examination Conduct</option>
          <option value="Probation & Withdrawal">Probation & Withdrawal</option>
          <option value="Clinical & Ward Regulations">Clinical & Ward Regulations</option>
          <option value="General Academic Rules">General Academic Rules</option>
        </select>
      </div>

      {/* Policy Articles */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading regulations handbook…</div>
        ) : policies.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            No policy records matched your search query.
          </div>
        ) : (
          policies.map((policy) => (
            <div key={policy.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900">{policy.title}</h2>
                <span className="self-start sm:self-auto px-3 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-full">
                  {policy.category}
                </span>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                {policy.content}
              </div>
              <div className="text-[10px] text-slate-400 pt-2">
                Last updated: {new Date(policy.updatedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
