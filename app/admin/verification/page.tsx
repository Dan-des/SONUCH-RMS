'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { TableSkeletonLoader } from '../../../components/SkeletonLoader';

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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Student Verification Queue"
        pageSubtitle="Review self-registered nursing students, approve verifications, and activate full portal access."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Control Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Admissions Review
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Pending Student Verifications
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              School of Nursing, UCH | Active Session: {activeSession}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded">
              {totalPending} Pending Approval
            </span>
            <button
              onClick={fetchPendingStudents}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-semibold transition-colors"
              type="button"
            >
              Refresh Queue
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

        {/* Level Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-1">
          {LEVELS.map((lvl) => {
            const count = (groupedStudents[lvl] || []).length;
            const isActive = activeTab === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setActiveTab(lvl)}
                className={`px-4 py-2 text-xs font-bold rounded-t transition-colors flex items-center gap-1.5 flex-shrink-0 ${
                  isActive
                    ? 'bg-white border-t-2 border-x border-t-emerald-800 border-x-slate-200 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                type="button"
              >
                <span>{lvl}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    count > 0
                      ? isActive
                        ? 'bg-emerald-100 text-emerald-900 font-bold'
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
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {activeTab} Pending Registrations ({currentTabStudents.length})
            </h2>
            {currentTabStudents.length > 0 && (
              <button
                onClick={() => handleVerify(currentTabStudents.map((s) => s.id))}
                disabled={verifyingIds.length > 0}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded transition-colors"
                type="button"
              >
                Verify All {activeTab} ({currentTabStudents.length})
              </button>
            )}
          </div>

          {loading ? (
            <TableSkeletonLoader rows={4} cols={5} />
          ) : currentTabStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
              <p className="font-semibold text-slate-700">No pending registrations for {activeTab}.</p>
              <p className="text-slate-400">Newly registered students in this cohort will appear here for verification.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-institutional">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Matriculation No</th>
                    <th>Email Address</th>
                    <th>Admission Year</th>
                    <th>Registered Date</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentTabStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-900">{student.fullName}</td>
                      <td className="font-mono text-emerald-900 font-bold">{student.matricNo}</td>
                      <td className="text-slate-600">{student.email}</td>
                      <td className="text-slate-700">{student.admissionYear}</td>
                      <td className="text-slate-500">
                        {new Date(student.createdAt).toLocaleDateString('en-NG')}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleVerify([student.id])}
                          disabled={verifyingIds.includes(student.id)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold rounded text-xs transition-colors disabled:opacity-50"
                          type="button"
                        >
                          {verifyingIds.includes(student.id) ? 'Verifying…' : 'Approve & Verify'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
