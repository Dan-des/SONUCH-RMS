'use client';

import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800">Level Result Release Countdown Manager</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Set an optional target release timestamp per level. Student portals will display a live countdown timer and server automatically unlocks results when the target time is reached.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Setter Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Configure Release Countdown</h2>
          <form onSubmit={handleSetRelease} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Release Date & Time</label>
              <input
                type="datetime-local"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              {saving ? 'Saving Countdown…' : `Set Countdown for ${selectedLevel}`}
            </button>
          </form>
        </div>

        {/* Existing Release Schedule */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Active Level Release Schedules</h2>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading countdown schedules…</div>
          ) : existingReleases.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No active release countdowns set for {activeSession}. Results unlock immediately when entered.
            </div>
          ) : (
            <div className="space-y-3">
              {existingReleases.map((r) => {
                const target = new Date(r.releaseDate);
                const isPassed = new Date() >= target;
                return (
                  <div key={r.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm text-slate-800">{r.level}</span>
                      <p className="text-xs text-slate-500 font-medium">{target.toLocaleString()}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isPassed ? 'Unlocked' : 'Counting Down'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
