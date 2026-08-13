'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AdminNavbar } from '../../../../components/AdminNavbar';

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Academic Session Progression Manager"
        pageSubtitle="Setting the active academic session automatically recalculates and promotes all student levels across the portal in real time."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
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

        <div className="max-w-xl bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-6">
          <div className="bg-teal-50 border border-teal-200 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">Current Active Session</p>
              <p className="text-2xl font-black text-teal-900 mt-1">{loading ? 'Loading…' : activeSession}</p>
            </div>
            <div className="p-3.5 bg-teal-800 text-white rounded-2xl shadow-xs">
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
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Format: YYYY/YYYY (e.g. 2026/2027)</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating Session…' : 'Promote Academic Session Institution-Wide'}</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
