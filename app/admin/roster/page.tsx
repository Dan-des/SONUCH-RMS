'use client';

import React, { useState, useEffect } from 'react';

const LEVELS = ['All Levels', '100L', '200L', '300L', '400L', '500L', 'Graduated'];
const STATUSES = ['All Statuses', 'verified', 'pending_verification'];

export default function AdminRosterPage() {
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLevel, setExportLevel] = useState('all');
  const [exportStatus, setExportStatus] = useState('all');

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/verification');
      const data = await res.json();
      if (res.ok && data.groupedStudents) {
        // Flatten grouped students
        const all: any[] = [];
        Object.entries(data.groupedStudents).forEach(([lvl, list]: [string, any]) => {
          list.forEach((item: any) => all.push({ ...item, level: lvl }));
        });
        setStudents(all);
      }
    } catch (err) {
      console.error('Failed to fetch roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const query = new URLSearchParams();
    if (exportLevel !== 'all') query.append('level', exportLevel);
    if (exportStatus !== 'all') query.append('status', exportStatus);

    window.location.href = `/api/admin/export?${query.toString()}`;
    setExportModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800">Student Directory & Roster</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse institution-wide student records and export demographic data directly to CSV.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Student CSV
          </button>
        </div>
      </div>

      {/* Roster Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
          Enrolled Students Directory ({students.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading student directory…</div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            No registered student records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Matric No</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.fullName}</td>
                    <td className="py-3 px-4 font-mono text-emerald-800 font-bold">{s.matricNo}</td>
                    <td className="py-3 px-4 text-slate-600">{s.email}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{s.calculatedLevel || s.level}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800">Export Student Records (CSV)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Configure filtering options to generate and stream a custom student roster spreadsheet.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Level Filter</label>
                <select
                  value={exportLevel}
                  onChange={(e) => setExportLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">All Levels</option>
                  <option value="100L">100L Only</option>
                  <option value="200L">200L Only</option>
                  <option value="300L">300L Only</option>
                  <option value="400L">400L Only</option>
                  <option value="500L">500L Only</option>
                  <option value="Graduated">Graduated Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Verification Status</label>
                <select
                  value={exportStatus}
                  onChange={(e) => setExportStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="all">All Statuses (Verified & Pending)</option>
                  <option value="verified">Verified Students Only</option>
                  <option value="pending_verification">Pending Verification Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                Download Streamed CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
