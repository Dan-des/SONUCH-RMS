'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  CheckCircle2,
  Clock,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';
import { AdminNavbar } from '../../../components/AdminNavbar';

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminNavbar
        activeSession={activeSession}
        pageTitle="Student Directory & Roster"
        pageSubtitle="Browse institution-wide registered nursing student records and export demographic data directly to CSV."
        showBack={true}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Enrolled Student Registry</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Session {activeSession} • Complete registered nursing student records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRoster()}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-xs"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-800' : ''}`} />
            </button>
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Roster CSV</span>
            </button>
          </div>
        </div>

        {/* Directory Stats Counter */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-slate-100 rounded-xl text-slate-700">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Enrolled</p>
                <p className="text-xl font-black text-slate-900">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Verified</p>
                <p className="text-xl font-black text-emerald-800">{stats.verified}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending</p>
                <p className="text-xl font-black text-amber-800">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3.5">
              <div className="p-3 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Session</p>
                <p className="text-sm font-black text-indigo-900 mt-0.5">{activeSession}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student name, matriculation no., or email…"
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full md:w-40 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-48 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shadow-xs"
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Roster Table Card */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Enrolled Students ({students.length})
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              Filtered: {selectedLevel} • {selectedStatus}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400">Loading student directory…</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              No student records matched the current filters.
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
                    <th className="py-3 px-4">Admission</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-teal-800">
                          {s.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{s.fullName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-teal-800 font-bold">{s.matricNo}</td>
                      <td className="py-3.5 px-4 text-slate-600">{s.email}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-800">{s.calculatedLevel}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{s.admissionYear}</td>
                      <td className="py-3.5 px-4 text-slate-600">{s.phone || '—'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'verified'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {s.status === 'verified' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-700" />
                          )}
                          <span>{s.status === 'verified' ? 'Verified' : 'Pending'}</span>
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
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-teal-800" />
                <span>Export Student Records (CSV)</span>
              </h3>
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
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
