'use client';

import React, { useState, useEffect } from 'react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';
import { TableSkeletonLoader } from '../../../components/SkeletonLoader';

const LEVELS = ['All Levels', '100L', '200L', '300L', '400L', '500L'];
const SEMESTERS = [
  { label: 'All Semesters', value: 'all' },
  { label: 'First Semester', value: '1' },
  { label: 'Second Semester', value: '2' },
];

export default function StudentResultsPage() {
  const [student, setStudent] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState<number>(0);
  const [totalCreditUnits, setTotalCreditUnits] = useState<number>(0);
  const [activeSession, setActiveSession] = useState('2026/2027');
  const [releaseLock, setReleaseLock] = useState<any>(null);

  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [loading, setLoading] = useState(true);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const [profileRes, gradesRes, releaseRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/student/grades'),
        fetch('/api/student/result-release'),
      ]);

      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.student) {
          setStudent(pData.student);
          if (pData.student.currentLevel) {
            setSelectedLevel(pData.student.currentLevel);
          }
        }
      }

      if (gradesRes.ok) {
        const gData = await gradesRes.json();
        setGrades(gData.grades || []);
        setCgpa(gData.cgpa || 0);
        setTotalCreditUnits(gData.totalCreditUnits || 0);
        if (gData.activeSession) setActiveSession(gData.activeSession);
      }

      if (releaseRes.ok) {
        const rData = await releaseRes.json();
        setReleaseLock(rData);
      }
    } catch (err) {
      console.error('Failed to load grades:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter grades in memory
  const filteredGrades = grades.filter((g) => {
    if (selectedLevel !== 'All Levels' && g.level !== selectedLevel) return false;
    if (selectedSemester !== 'all' && String(g.semester) !== selectedSemester) return false;
    return true;
  });

  // Calculate Semester GPA for currently filtered view
  let filteredQP = 0;
  let filteredUnits = 0;
  filteredGrades.forEach((g) => {
    const unit = Number(g.unit) || 0;
    const gp = Number(g.gradePoint) || 0;
    filteredQP += gp * unit;
    filteredUnits += unit;
  });
  const filteredGPA = filteredUnits > 0 ? +(filteredQP / filteredUnits).toFixed(2) : 0;

  const isLocked = releaseLock?.isLocked;

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 text-slate-900">
      {/* Top Navbar */}
      <div className="no-print">
        <StudentNavbar
          studentName={student?.fullName}
          matricNo={student?.matricNo}
          currentLevel={student?.currentLevel}
          showBack={true}
        />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 no-print">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block">
              Academic Performance Record
            </span>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              Examination Results & Transcript
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Official UCH School of Nursing semester transcripts, quality points, and certified statement generator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchResults()}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 transition-colors"
              type="button"
            >
              Refresh
            </button>
            <button
              onClick={() => setPdfModalOpen(true)}
              disabled={filteredGrades.length === 0 || isLocked}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded transition-colors disabled:opacity-50"
              type="button"
            >
              Print Official Statement (PDF)
            </button>
          </div>
        </div>

        {/* GPA Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Filtered GPA</p>
            <p className="text-2xl font-bold text-emerald-900">{filteredGPA.toFixed(2)}</p>
            <p className="text-xs text-slate-500">{selectedLevel} | {selectedSemester === '1' ? 'Sem 1' : selectedSemester === '2' ? 'Sem 2' : 'All Semesters'}</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cumulative CGPA</p>
            <p className="text-2xl font-bold text-slate-900">{cgpa.toFixed(2)}</p>
            <p className="text-xs text-slate-500">5.00 Point Maximum</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Credit Units Earned</p>
            <p className="text-2xl font-bold text-slate-900">{totalCreditUnits}</p>
            <p className="text-xs text-slate-500">Cumulative Passed Units</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Standing Classification</p>
            <p className="text-base font-bold text-emerald-900 mt-1">
              {cgpa >= 4.5 ? 'First Class Distinction' : cgpa >= 3.5 ? 'Upper Credit' : cgpa >= 2.5 ? 'Lower Credit' : 'Pass'}
            </p>
            <p className="text-xs text-slate-500">Good Standing</p>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-bold text-slate-700 focus:outline-none"
          >
            {SEMESTERS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Grade Results Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Official Examination Grades ({filteredGrades.length})
              </h2>
              <p className="text-xs text-slate-500">
                Session {activeSession} | {selectedLevel}
              </p>
            </div>

            {isLocked && (
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold rounded">
                Release Pending Countdown
              </span>
            )}
          </div>

          {isLocked ? (
            <div className="py-10 text-center space-y-2 bg-amber-50 border border-amber-200 rounded p-6">
              <h3 className="text-sm font-bold text-amber-900">Results Under Release Lock</h3>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                Examination scores for {student?.currentLevel} are currently under automated countdown and will unlock automatically.
              </p>
            </div>
          ) : loading ? (
            <TableSkeletonLoader rows={5} cols={8} />
          ) : filteredGrades.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 border border-slate-200 rounded p-8 space-y-1">
              <p className="font-semibold text-slate-700">No grades found for the selected level and semester filters.</p>
              <p className="text-slate-400">Newly recorded examination marks from the board will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-institutional">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Units</th>
                    <th>CA (30)</th>
                    <th>Exam (70)</th>
                    <th>Total (100)</th>
                    <th>Grade</th>
                    <th>Grade Point</th>
                    <th>Quality Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50">
                      <td className="font-mono font-bold text-emerald-900">{g.courseCode}</td>
                      <td className="font-bold text-slate-900">{g.courseTitle}</td>
                      <td className="font-bold text-slate-700">{g.unit}</td>
                      <td className="text-slate-600">{g.caScore}</td>
                      <td className="text-slate-600">{g.examScore}</td>
                      <td className="font-bold text-slate-900">{g.totalScore}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                          {g.letterGrade}
                        </span>
                      </td>
                      <td className="font-bold text-slate-700">{Number(g.gradePoint).toFixed(1)}</td>
                      <td className="font-bold text-slate-900">{Number(g.qualityPoints || (g.gradePoint * g.unit)).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Official PDF Statement Modal & Print Preview */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70">
          <div className="w-full max-w-3xl bg-white rounded-lg border border-slate-300 p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Controls (Hidden in Print) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Official Statement of Results Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintPdf}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded"
                  type="button"
                >
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setPdfModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded border border-slate-300"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Printable Statement Sheet */}
            <div className="border-2 border-slate-800 p-6 sm:p-8 space-y-6 bg-white">
              {/* College Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
                <img
                  src="/logo.png"
                  alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
                  className="w-14 h-14 object-contain mx-auto mb-1"
                />
                <h2 className="text-lg font-bold text-slate-900 uppercase">
                  School of Nursing, University College Hospital
                </h2>
                <p className="text-xs text-slate-700">P.M.B. 5116, Ibadan, Oyo State, Nigeria</p>
                <p className="text-xs font-bold uppercase text-emerald-900 tracking-wider mt-1">
                  Official Statement of Academic Results
                </p>
              </div>

              {/* Student Demographics Block */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                <div>
                  <p><strong className="text-slate-900">Student Name:</strong> {student?.fullName}</p>
                  <p className="mt-1"><strong className="text-slate-900">Matriculation No:</strong> {student?.matricNo}</p>
                  <p className="mt-1"><strong className="text-slate-900">Admission Year:</strong> {student?.admissionYear}</p>
                </div>
                <div>
                  <p><strong className="text-slate-900">Current Level:</strong> {selectedLevel}</p>
                  <p className="mt-1"><strong className="text-slate-900">Academic Session:</strong> {activeSession}</p>
                  <p className="mt-1"><strong className="text-slate-900">Date Issued:</strong> {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {/* Course & Grade Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-400">
                  <thead className="bg-slate-100 font-bold uppercase text-[10px] border-b border-slate-400">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-300">Course Code</th>
                      <th className="py-2 px-3 border-r border-slate-300">Course Title</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center">Unit</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center">Total (100)</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center">Grade</th>
                      <th className="py-2 px-3 text-center">Quality Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {filteredGrades.map((g) => (
                      <tr key={g.id}>
                        <td className="py-2 px-3 font-mono font-bold border-r border-slate-200">{g.courseCode}</td>
                        <td className="py-2 px-3 border-r border-slate-200">{g.courseTitle}</td>
                        <td className="py-2 px-3 text-center border-r border-slate-200">{g.unit}</td>
                        <td className="py-2 px-3 text-center font-bold border-r border-slate-200">{g.totalScore}</td>
                        <td className="py-2 px-3 text-center font-bold border-r border-slate-200">{g.letterGrade}</td>
                        <td className="py-2 px-3 text-center font-bold">{Number(g.qualityPoints || (g.gradePoint * g.unit)).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* GPA & CGPA Summary Block */}
              <div className="bg-slate-50 border border-slate-300 p-4 rounded flex items-center justify-between text-xs">
                <div>
                  <p><strong className="text-slate-900">Total Credit Units Registered:</strong> {filteredUnits}</p>
                  <p className="mt-0.5"><strong className="text-slate-900">Total Quality Points:</strong> {filteredQP.toFixed(1)}</p>
                </div>
                <div className="text-right">
                  <p><strong className="text-slate-900">Semester GPA:</strong> <span className="font-bold text-sm text-emerald-900">{filteredGPA.toFixed(2)}</span></p>
                  <p className="mt-0.5"><strong className="text-slate-900">Cumulative CGPA:</strong> <span className="font-bold text-sm text-slate-900">{cgpa.toFixed(2)} / 5.00</span></p>
                </div>
              </div>

              {/* Official Stamp & Signatures Footer */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-bold">
                <div className="space-y-1">
                  <div className="h-10 border-b border-slate-800 w-48 mx-auto" />
                  <p className="text-slate-800 font-bold">Examination Officer</p>
                  <p className="text-[10px] text-slate-500">School of Nursing, UCH</p>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-slate-800 w-48 mx-auto" />
                  <p className="text-slate-800 font-bold">Academic Registrar</p>
                  <p className="text-[10px] text-slate-500">Official Seal & Signature</p>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
                Certified computer-generated statement of examination results from the UCH Results Management System (RMS).
              </div>
            </div>
          </div>
        </div>
      )}

      <MobileBottomBar />
      <InstitutionalFooter />
    </div>
  );
}
