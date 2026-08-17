'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { CardSkeletonLoader } from '../../../components/SkeletonLoader';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [targetAudience, setTargetAudience] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message: messageText,
          priority,
          targetAudience,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch notification');
      }

      setFeedback({ type: 'success', text: data.message });
      setTitle('');
      setMessageText('');
      fetchNotifications();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        pageTitle="Targeted Broadcast Notification Center"
        pageSubtitle="Compose in-app announcements and automatically dispatch Brevo batch email alerts to targeted student cohorts."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Communications Center
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Campus Cohort Broadcast System
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Dispatch instantaneous in-app alerts and transactional email circulars by academic level.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-semibold transition-colors"
              type="button"
            >
              Refresh Broadcasts
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded text-xs font-semibold border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Composer Form */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Compose Circular Announcement
              </h2>
              <p className="text-xs text-slate-500">Broadcast notice to student portals and email</p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clinical Posting Timetable for Second Semester"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Cohort
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="all">Entire Institution (All Students)</option>
                    <option value="100L">100L Students Only</option>
                    <option value="200L">200L Students Only</option>
                    <option value="300L">300L Students Only</option>
                    <option value="400L">400L Students Only</option>
                    <option value="500L">500L Students Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message Body
                </label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write announcement body..."
                  required
                  rows={5}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition-colors"
              >
                {sending ? 'Dispatching Broadcast…' : 'Publish & Dispatch Broadcast'}
              </button>
            </form>
          </div>

          {/* History Log */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Broadcast History ({notifications.length})
              </h2>
              <p className="text-xs text-slate-500">Archived notifications and dispatches</p>
            </div>

            {loading ? (
              <CardSkeletonLoader count={2} />
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
                <p className="font-semibold text-slate-700">No previous announcements dispatched.</p>
                <p className="text-slate-400">Dispatched campus notifications and cohort broadcasts will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <article key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{n.title}</span>
                      <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold rounded uppercase">
                        {n.targetAudience}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{n.message}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span>Sent on {new Date(n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-slate-600 font-semibold">{n.createdBy}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
