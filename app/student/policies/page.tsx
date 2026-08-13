'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Search, FileText, RefreshCw } from 'lucide-react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';

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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8 text-slate-900">
      <StudentNavbar showBack={true} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">Academic Policy & Regulations Handbook</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                School of Nursing, UCH Ibadan • Official Regulations Handbook & Guidelines
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

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search academic regulations, grading formulas, probation rules…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none shadow-xs"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-56 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
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
            <div className="py-12 text-center text-xs text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600">No institutional policies published yet.</p>
              <p className="text-[11px] text-slate-400">New academic regulations published by the board will appear here.</p>
            </div>
          ) : (
            policies.map((policy) => (
              <div key={policy.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h2 className="text-base font-black text-slate-900">{policy.title}</h2>
                  <span className="self-start sm:self-auto px-3 py-1 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold rounded-full">
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
      </main>

      <MobileBottomBar />
    </div>
  );
}
