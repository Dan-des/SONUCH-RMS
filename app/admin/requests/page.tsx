'use client';

import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Registration Unlock Requests</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Review student requests to correct locked registration details. Approving grants a temporary 24-hour edit window.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
        >
          Refresh
        </button>
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            Fetching pending unlock requests…
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            No pending registration correction requests.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{req.studentName}</span>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {req.matricNo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{req.email}</p>
                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 mt-2 font-medium">
                    <strong className="text-slate-900">Reason:</strong> "{req.reason}"
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    disabled={actionId === req.id}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    disabled={actionId === req.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    {actionId === req.id ? 'Processing…' : 'Grant 24-Hour Edit Access'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
