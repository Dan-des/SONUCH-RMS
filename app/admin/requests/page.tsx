'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { CardSkeletonLoader } from '../../../components/SkeletonLoader';

export default function AdminUnlockRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/unlock-requests');
      const data = await res.json();
      if (res.ok) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setActionId(requestId);
      setMessage(null);

      const res = await fetch('/api/admin/unlock-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      setMessage({ type: 'success', text: data.message });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        pageTitle="Registration Correction & Unlock Requests"
        pageSubtitle="Review student requests to correct locked registration details. Approving grants a temporary 24-hour edit window."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Admissions Appeals
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Biodata Correction & Unlock Appeals
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Students can request one-time access to edit immutable admission records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold rounded">
              {requests.length} Pending Requests
            </span>
            <button
              onClick={fetchRequests}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-semibold transition-colors"
              type="button"
            >
              Refresh
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

        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Pending Correction Requests ({requests.length})
            </h2>
          </div>

          {loading ? (
            <CardSkeletonLoader count={2} />
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
              <p className="font-semibold text-slate-700">No pending registration correction requests.</p>
              <p className="text-slate-400">Submitted student correction appeals will appear here for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded">
                        {req.matricNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{req.email}</p>
                    <div className="text-xs text-slate-700 bg-white p-3 rounded border border-slate-200 mt-2">
                      <strong className="text-slate-900">Justification:</strong> &quot;{req.reason}&quot;
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAction(req.id, 'reject')}
                      disabled={actionId === req.id}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors"
                      type="button"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'approve')}
                      disabled={actionId === req.id}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded transition-colors"
                      type="button"
                    >
                      {actionId === req.id ? 'Processing…' : 'Grant 24-Hour Edit Access'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
