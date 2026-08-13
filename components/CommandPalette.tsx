'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CommandItem {
  id: string;
  title: string;
  category: string;
  path: string;
  description: string;
}

const COMMAND_ITEMS: CommandItem[] = [
  { id: '1', title: 'Student Verification Queue', category: 'Admissions', path: '/admin/verification', description: 'Review & approve pending student self-registrations' },
  { id: '2', title: 'Registration Unlock Requests', category: 'Admissions', path: '/admin/requests', description: 'Review correction requests & grant 24-hour edit access' },
  { id: '3', title: 'Student Roster & Export', category: 'Directory', path: '/admin/roster', description: 'Browse student roster & stream filtered CSV records' },
  { id: '4', title: 'Curriculum Course Manager', category: 'Academics', path: '/admin/courses', description: 'Manage course codes, credit units, and semesters' },
  { id: '5', title: 'Result Processing & Grade Entry', category: 'Academics', path: '/admin/results', description: 'Enter CA & exam scores and compute CGPA' },
  { id: '6', title: 'Result Release Countdown Setter', category: 'Academics', path: '/admin/results/release', description: 'Set level-based result countdown release dates' },
  { id: '7', title: 'Academic Session Settings', category: 'System', path: '/admin/settings/session', description: 'Promote active academic session institution-wide' },
  { id: '8', title: 'Academic Policy CMS', category: 'Regulations', path: '/admin/policies', description: 'Publish & edit grading schemes, rules, and handbooks' },
  { id: '9', title: 'Broadcast Notifications & Alerts', category: 'Communications', path: '/admin/notifications', description: 'Compose notices & dispatch Brevo batch email alerts' },
];

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(path);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search admin features (e.g. Verification, Roster, Session)..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-800 focus:outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-mono font-bold">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No commands matched "{query}".</div>
          ) : (
            filteredCommands.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.path)}
                className="w-full p-3 text-left hover:bg-emerald-50/60 rounded-xl transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800">{item.title}</span>
                    <span className="px-2 py-0.5 bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-800 text-[10px] font-bold rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.description}</p>
                </div>
                <span className="text-xs text-emerald-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Jump →</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
