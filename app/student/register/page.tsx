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
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (!matricNo.trim() || !fullName.trim() || !email.trim()) {
      setError('Please fill in all required institutional fields.');
      return;
    }

    // Intercept form submission with mandatory confirmation modal
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
          fullName: fullName.trim(),
          matricNo: matricNo.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
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
      // Redirect to formal confirmation thank-you receipt page
      window.location.href = '/student/confirmation';
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-slate-300 p-6 sm:p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
              className="h-14 w-auto object-contain mx-auto"
            />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">School of Nursing, UCH</h1>
          <p className="text-xs text-slate-500 font-medium">Student Portal Self-Registration</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          {/* Admission Year & Real-time Level Badge */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">
                Admission Cohort Year
              </label>
              <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                Level: {calculatedLevel}
              </span>
            </div>
            <select
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:outline-none"
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
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Legal Name (Surname First)
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. OLATUNDE Daniel Tobi"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Matric Number */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Matriculation Number
            </label>
            <input
              type="text"
              value={matricNo}
              onChange={(e) => setMatricNo(e.target.value)}
              placeholder="e.g. UCH/NUR/2026/001"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-mono uppercase text-slate-800 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Personal Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Account Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-1 leading-normal">
            By submitting this form, you agree to the{' '}
            <Link href="/terms" target="_blank" className="text-emerald-800 font-semibold underline">
              Terms of Usage
            </Link>{' '}
            and{' '}
            <Link href="/privacy" target="_blank" className="text-emerald-800 font-semibold underline">
              Data Privacy Policy
            </Link>
            .
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded text-xs transition-colors"
          >
            Submit Registration
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link href="/student/login" className="text-emerald-800 font-bold hover:underline">
            Sign In to Student Portal
          </Link>
        </div>
      </div>

      {/* Confirmation Modal Interceptor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-300 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Confirm Registration Details
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 p-3 rounded">
              Please verify your submitted details carefully. Admission year, full name, matriculation number, and email address cannot be modified after submission without formal administrative approval.
            </p>
            <div className="bg-slate-50 p-3 rounded text-xs text-slate-700 border border-slate-200 space-y-1">
              <div><span className="font-bold">Full Legal Name:</span> {fullName}</div>
              <div><span className="font-bold">Matric Number:</span> {matricNo.toUpperCase()}</div>
              <div><span className="font-bold">Cohort Year:</span> {admissionYear} ({calculatedLevel})</div>
              <div><span className="font-bold">Email Address:</span> {email}</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
              >
                Go Back & Edit
              </button>
              <button
                type="button"
                onClick={confirmRegistration}
                disabled={loading}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded"
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
