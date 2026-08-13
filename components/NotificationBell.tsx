'use client';

import React, { useState, useEffect } from 'react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/student/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        aria-label="Open Announcements"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white font-extrabold text-[10px] rounded-full animate-pulse shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-slate-800">Announcements & Notices</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading notices…</div>
              ) : notifications.length === 0 ? (
                <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                  No announcements at this time.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      n.isRead
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{n.title}</h4>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${
                          n.priority === 'urgent'
                            ? 'bg-red-100 text-red-700'
                            : n.priority === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {n.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap font-medium">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                      <span>{new Date(n.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="text-emerald-700 font-bold hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
