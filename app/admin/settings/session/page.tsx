'use client';

import React, { useState, useEffect } from 'react';

export default function AdminSessionSettingsPage() {
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [inputSession, setInputSession] = useState('2026/2027');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/session');
      const data = await res.json();

      if (res.ok && data.activeSession) {
        setActiveSession(data.activeSession);
        setInputSession(data.activeSession);
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeSession: inputSession.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update session');
      }

      setMessage({ type: 'success', text: data.message });
      setActiveSession(data.activeSession);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800">Academic Session Manager</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Setting the institution-wide active academic session automatically recalculates and promotes all student levels across the portal in real time.
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

      <div className="max-w-md bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Current Active Session</p>
          <p className="text-2xl font-black text-emerald-900 mt-1">{loading ? 'Loading…' : activeSession}</p>
        </div>

        <form onSubmit={handleUpdateSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Academic Session String
            </label>
            <input
              type="text"
              value={inputSession}
              onChange={(e) => setInputSession(e.target.value)}
              placeholder="e.g. 2026/2027 or 2027/2028"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Format: YYYY/YYYY (e.g. 2026/2027)</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
          >
            {saving ? 'Updating Session…' : 'Promote Academic Session Institution-Wide'}
          </button>
        </form>
      </div>
    </div>
  );
}
