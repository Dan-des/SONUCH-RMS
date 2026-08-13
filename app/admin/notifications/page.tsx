'use client';

import React, { useState, useEffect } from 'react';

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
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-xl font-extrabold text-slate-800">Targeted Broadcast Notification Center</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Compose in-app announcements and automatically dispatch Brevo transactional broadcast email alerts to targeted student levels.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Composer Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Compose Announcement</h2>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clinical Posting Timetable for Second Semester"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
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
                placeholder="Write message details in full..."
                required
                rows={5}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              {sending ? 'Dispatching Broadcast…' : 'Publish & Dispatch Email Broadcast'}
            </button>
          </form>
        </div>

        {/* History Log */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Broadcast History ({notifications.length})</h2>
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading broadcast history…</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No previous announcements dispatched.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-900">{n.title}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full uppercase">
                      {n.targetAudience}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.message}</p>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Sent on {new Date(n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} by {n.createdBy}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
