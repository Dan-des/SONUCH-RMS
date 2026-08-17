'use client';

import React, { useState, useEffect } from 'react';
import { AdminNavbar } from '../../../components/AdminNavbar';
import { TableSkeletonLoader } from '../../../components/SkeletonLoader';

const LEVELS = ['All Levels', '100L', '200L', '300L', '400L', '500L', 'Graduated'];
const STATUSES = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Verified Students', value: 'verified' },
  { label: 'Pending Verification', value: 'pending_verification' },
];

export default function AdminRosterPage() {
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportLevel, setExportLevel] = useState('all');
  const [exportStatus, setExportStatus] = useState('all');

  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoster();
  }, [selectedLevel, selectedStatus, searchQuery]);

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (selectedLevel !== 'All Levels') query.append('level', selectedLevel);
      if (selectedStatus !== 'all') query.append('status', selectedStatus);
      if (searchQuery.trim()) query.append('q', searchQuery.trim());

      const res = await fetch(`/api/admin/roster?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        setStats(data.stats || null);
        if (data.activeSession) setActiveSession(data.activeSession);
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
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Student Directory & Roster"
        pageSubtitle="Browse registered student records, filter cohort levels, and export demographic data."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Enrolled Student Registry
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Active Admissions Directory
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Academic Session {activeSession} | Total Registered: {stats?.total || 0}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRoster()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-semibold transition-colors"
              type="button"
            >
              Refresh Directory
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded transition-colors"
              type="button"
            >
              Export Roster CSV
            </button>
          </div>
        </div>

        {/* Directory Stats Counter */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Registered</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verified Accounts</p>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{stats.verified}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Verification</p>
              <p className="text-xl font-bold text-amber-800 mt-0.5">{stats.pending}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Session</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{activeSession}</p>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, matriculation no., or email..."
            className="flex-1 w-full px-3.5 py-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
          />

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full md:w-36 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-48 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Roster Table Card */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Enrolled Students ({students.length})
            </h2>
            <span className="text-xs text-slate-500 font-semibold">
              Filter: {selectedLevel} | {selectedStatus}
            </span>
          </div>

          {loading ? (
            <TableSkeletonLoader rows={6} cols={6} />
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 p-8 space-y-1">
              <p className="font-semibold text-slate-700">No student records match the active criteria.</p>
              <p className="text-slate-400">Try adjusting your search query or level filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-institutional">
                <thead>
                  <tr>
                    <th>Full Legal Name</th>
                    <th>Matric Number</th>
                    <th>Email Address</th>
                    <th>Cohort Level</th>
                    <th>Admission Year</th>
                    <th>Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="font-bold text-slate-900">
                        {s.fullName}
                      </td>
                      <td className="font-mono text-emerald-900 font-bold">{s.matricNo}</td>
                      <td className="text-slate-600">{s.email}</td>
                      <td className="font-bold text-slate-800">{s.calculatedLevel}</td>
                      <td className="text-slate-600">{s.admissionYear}</td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {s.status === 'verified' ? 'Verified' : 'Pending'}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
            <div className="w-full max-w-md bg-white rounded-lg border border-slate-300 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Export Student Records (CSV)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select target filters to export an official spreadsheet of student demographic and enrollment data.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Cohort Level</label>
                  <select
                    value={exportLevel}
                    onChange={(e) => setExportLevel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="all">All Statuses (Verified & Pending)</option>
                    <option value="verified">Verified Students Only</option>
                    <option value="pending_verification">Pending Verification Only</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
