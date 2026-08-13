'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-700">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Academic Session Manager</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Setting the active academic session automatically recalculates and promotes all student levels across the portal in real time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSession}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors shadow-sm"
            title="Refresh Session"
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

      <div className="max-w-md bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">Current Active Session</p>
            <p className="text-2xl font-black text-teal-900 mt-1">{loading ? 'Loading…' : activeSession}</p>
          </div>
          <div className="p-3 bg-teal-100 rounded-xl text-teal-800">
            <Calendar className="w-6 h-6" />
          </div>
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Format: YYYY/YYYY (e.g. 2026/2027)</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{saving ? 'Updating Session…' : 'Promote Academic Session Institution-Wide'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
