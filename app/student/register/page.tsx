'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { calculateLevel } from '../../../lib/level-calculator';

export default function StudentRegisterPage() {
  const router = useRouter();

  const [admissionYear, setAdmissionYear] = useState<number>(2026);
  const [fullName, setFullName] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [activeSession, setActiveSession] = useState('2026/2027');
  const [calculatedLevel, setCalculatedLevel] = useState('100L');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate level dynamically when admission year changes
  useEffect(() => {
    setCalculatedLevel(calculateLevel(admissionYear, activeSession));
  }, [admissionYear, activeSession]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!matricNo.trim() || !fullName.trim() || !email.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Intercept form submission with mandatory immutability warning modal
    setShowModal(true);
  };

  const confirmRegistration = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          matricNo,
          email,
          admissionYear,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setShowModal(false);
      router.push('/pending');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src="/logo.png" alt="SONUCH Logo" className="h-16 w-auto object-contain mb-2" />
          <h1 className="text-xl font-extrabold text-slate-800">School of Nursing, UCH</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Student Portal Self-Registration</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Admission Year & Real-time Level Badge */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Admission Year
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
                Current Level: {calculatedLevel}
              </span>
            </div>
            <select
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                <option key={yr} value={yr}>
                  {yr} {yr === 2026 ? '(Fresh Intake)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name (Surname First)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Olatunde Daniel Tobi"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Matric Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Matriculation Number
            </label>
            <input
              type="text"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              placeholder="UI/SONUCH/UTME/001"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono uppercase text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors duration-150 mt-2"
          >
            Submit Registration
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link href="/student/login" className="text-emerald-700 font-bold hover:underline">
            Sign in to Student Portal
          </Link>
        </div>
      </div>

      {/* Mandatory Immutability Warning Modal Interceptor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">Confirm Registration Details</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 p-3 rounded-xl">
              Please cross-check your registration details carefully. Admission Year, Name, Matric Number, and Email <strong>CANNOT</strong> be changed after submission except with official Admin approval.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl text-left space-y-1.5 text-xs text-slate-700 border border-slate-200">
              <div><span className="font-bold">Full Name:</span> {fullName}</div>
              <div><span className="font-bold">Matric No:</span> {matricNo.toUpperCase()}</div>
              <div><span className="font-bold">Admission Year:</span> {admissionYear} ({calculatedLevel})</div>
              <div><span className="font-bold">Email:</span> {email}</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={confirmRegistration}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                {loading ? 'Submitting…' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
