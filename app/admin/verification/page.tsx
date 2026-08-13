'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';

const LEVELS = ['100L', '200L', '300L', '400L', '500L', 'Graduated'];

export default function AdminVerificationPage() {
  const [activeTab, setActiveTab] = useState('100L');
  const [groupedStudents, setGroupedStudents] = useState<Record<string, any[]>>({});
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifyingIds, setVerifyingIds] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const fetchPendingStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/verification');
      const data = await res.json();

      if (res.ok) {
        setGroupedStudents(data.groupedStudents || {});
        setActiveSession(data.activeSession || '2026/2027');
        setTotalPending(data.totalPending || 0);
      }
    } catch (err) {
      console.error('Failed to fetch pending students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (studentIds: string[]) => {
    try {
      setVerifyingIds(studentIds);
      setMessage(null);

      const res = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setMessage({ type: 'success', text: data.message });
      fetchPendingStudents();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setVerifyingIds([]);
    }
  };

  const currentTabStudents = groupedStudents[activeTab] || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Student Verification Queue</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              School of Nursing, UCH • Active Academic Session: <span className="font-bold text-teal-700">{activeSession}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl shadow-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{totalPending} Pending Approval</span>
          </span>
          <button
            onClick={fetchPendingStudents}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors shadow-sm"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Admin Hub</span>
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Level Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {LEVELS.map((lvl) => {
          const count = (groupedStudents[lvl] || []).length;
          const isActive = activeTab === lvl;
          return (
            <button
              key={lvl}
              onClick={() => setActiveTab(lvl)}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 flex-shrink-0 ${
                isActive
                  ? 'bg-white border-t-2 border-x border-t-teal-700 border-x-slate-200 text-teal-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <span>{lvl}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  count > 0
                    ? isActive
                      ? 'bg-teal-100 text-teal-900 font-extrabold'
                      : 'bg-slate-200 text-slate-700 font-bold'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Student List View */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            {activeTab} Pending Registrations ({currentTabStudents.length})
          </h2>
          {currentTabStudents.length > 0 && (
            <button
              onClick={() => handleVerify(currentTabStudents.map((s) => s.id))}
              disabled={verifyingIds.length > 0}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Verify All {activeTab} ({currentTabStudents.length})</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            Fetching pending student records…
          </div>
        ) : currentTabStudents.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-8 space-y-2">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold">No pending registrations for {activeTab}.</p>
            <p className="text-[11px] text-slate-400">Newly self-registered students will appear here for verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Matriculation No</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Admission Year</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {currentTabStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{student.fullName}</td>
                    <td className="py-3 px-4 font-mono text-teal-800 font-bold">{student.matricNo}</td>
                    <td className="py-3 px-4 text-slate-600">{student.email}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{student.admissionYear}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(student.createdAt).toLocaleDateString('en-NG')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleVerify([student.id])}
                        disabled={verifyingIds.includes(student.id)}
                        className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 inline-flex shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                        <span>{verifyingIds.includes(student.id) ? 'Verifying…' : 'Approve & Verify'}</span>
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
  );
}
