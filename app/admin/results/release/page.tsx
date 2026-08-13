'use client';

import React, { useState, useEffect } from 'react';
import {
  Timer,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';
import { AdminNavbar } from '../../../../components/AdminNavbar';

const LEVELS = ['100L', '200L', '300L', '400L', '500L'];

export default function AdminResultReleasePage() {
  const [selectedLevel, setSelectedLevel] = useState('100L');
  const [releaseDate, setReleaseDate] = useState('');
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [existingReleases, setExistingReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/result-release');
      const data = await res.json();
      if (res.ok) {
        setExistingReleases(data.releases || []);
        setActiveSession(data.activeSession || '2026/2027');
      }
    } catch (err) {
      console.error('Failed to fetch releases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/result-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: selectedLevel,
          releaseDate,
          academicSession: activeSession,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to set release date');
      }

      setMessage({ type: 'success', text: data.message });
      fetchReleases();
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
        pageTitle="Result Release Countdown Manager"
        pageSubtitle="Configure level-based automated result release timers with dynamic auto-unlocking."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Scheduled Grade Releases</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Target release date locks student portal grade views until countdown expires.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchReleases}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
              title="Refresh Schedules"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-800' : ''}`} />
            </button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Setter Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-800" />
              <span>Configure Release Countdown</span>
            </h3>
            <form onSubmit={handleSetRelease} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Student Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Release Timestamp</label>
                <input
                  type="datetime-local"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Countdown…' : `Set Countdown for ${selectedLevel}`}</span>
              </button>
            </form>
          </div>

          {/* Existing Release Schedule */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-800" />
              <span>Active Release Schedules</span>
            </h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading countdown schedules…</div>
            ) : existingReleases.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
                <Unlock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold">No active countdowns configured.</p>
                <p className="text-[11px] text-slate-400">All examination results for {activeSession} are unlocked and accessible immediately.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingReleases.map((r) => {
                  const target = new Date(r.releaseDate);
                  const isPassed = new Date() >= target;
                  return (
                    <div key={r.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-sm text-slate-800">{r.level}</span>
                        <p className="text-xs text-slate-500 font-medium">{target.toLocaleString()}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                          isPassed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isPassed ? <Unlock className="w-3 h-3 text-emerald-700" /> : <Lock className="w-3 h-3 text-amber-700" />}
                        <span>{isPassed ? 'Unlocked' : 'Counting Down'}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
