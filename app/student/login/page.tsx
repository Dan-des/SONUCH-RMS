'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';

export default function StudentLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setFeedback({ type: 'success', message: 'Authentication successful! Redirecting to student portal...' });
      window.location.href = data.redirectUrl || '/student/dashboard';
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/logo.png"
              alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
              className="w-14 h-14 object-contain mx-auto"
            />
            <h1 className="text-lg font-bold text-slate-900">Student Portal Sign In</h1>
            <p className="text-xs text-slate-500 font-medium">
              School of Nursing, University College Hospital Ibadan
            </p>
          </div>

          {feedback && (
            <div
              className={`p-3.5 rounded text-xs font-semibold border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Matriculation No. or Email Address
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. UCH/NUR/2026/001 or email@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider">Account Password</label>
                <Link
                  href="/student/forgot-password"
                  className="text-xs text-emerald-800 font-bold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating…' : 'Sign In to Student Portal'}
            </button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 text-xs">
            <p className="text-slate-500 font-medium">
              New nursing student?{' '}
              <Link href="/student/register" className="text-emerald-800 font-bold hover:underline">
                Self-Register Account &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
}
