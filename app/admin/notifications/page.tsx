'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Send,
  History,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar
        pageTitle="Targeted Broadcast Notification Center"
        pageSubtitle="Compose in-app announcements and automatically dispatch Brevo batch email alerts to targeted student cohorts."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Campus Cohort Broadcast Hub</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dispatch instantaneous in-app alerts and Brevo transactional emails by academic level.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotifications}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
              title="Refresh Notifications"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-800' : ''}`} />
            </button>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Composer Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-teal-800" />
              <span>Compose Announcement</span>
            </h3>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Clinical Posting Timetable for Second Semester"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Message Body</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Write announcement body..."
                  required
                  rows={5}
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-700 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sending ? 'Dispatching Broadcast…' : 'Publish & Dispatch Broadcast'}</span>
              </button>
            </form>
          </div>

          {/* History Log */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-slate-200/90 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-teal-800" />
              <span>Broadcast History ({notifications.length})</span>
            </h3>
            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading broadcast history…</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 space-y-2">
                <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-semibold">No previous announcements dispatched.</p>
                <p className="text-[11px] text-slate-400">Dispatched campus notifications and cohort broadcasts will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{n.title}</span>
                      <span className="px-2.5 py-0.5 bg-teal-50 border border-teal-200 text-teal-900 text-[10px] font-bold rounded-full uppercase">
                        {n.targetAudience}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.message}</p>
                    <div className="text-[10px] text-slate-400 pt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Sent on {new Date(n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} by {n.createdBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
