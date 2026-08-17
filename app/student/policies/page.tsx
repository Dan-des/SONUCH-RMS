'use client';

import React, { useState, useEffect } from 'react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';
import { CardSkeletonLoader } from '../../../components/SkeletonLoader';

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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 text-slate-900">
      <StudentNavbar showBack={true} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Institutional Regulations
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Academic Policy & Regulations Handbook
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              School of Nursing, UCH Ibadan - Official Examination Guidelines & NMCN Standards
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPolicies()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-semibold transition-colors"
              type="button"
            >
              Refresh Policies
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search academic regulations, grading formulas, pass marks..."
            className="flex-1 w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-60 px-3 py-2.5 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
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
            <CardSkeletonLoader count={3} />
          ) : policies.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-lg p-8 space-y-1">
              <p className="font-semibold text-slate-700">No institutional policies published currently.</p>
              <p className="text-slate-400">Published regulations and grading scales from the Academic Board will appear here.</p>
            </div>
          ) : (
            policies.map((policy) => (
              <article key={policy.id} className="bg-white p-6 rounded-lg border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900">{policy.title}</h2>
                  <span className="self-start sm:self-auto px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded">
                    {policy.category}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {policy.content}
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  Last updated: {new Date(policy.updatedAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      <MobileBottomBar />
      <InstitutionalFooter />
    </div>
  );
}
