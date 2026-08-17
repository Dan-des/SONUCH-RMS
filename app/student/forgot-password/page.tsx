'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/student-reset-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch reset code');
      }

      setMessage({ type: 'success', text: data.message });
      setTimeout(() => {
        router.push(`/student/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg border border-slate-200 p-6 md:p-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <img
              src="/logo.png"
              alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
              className="h-14 w-auto object-contain mb-2"
            />
            <h1 className="text-lg font-bold text-slate-900">Account Password Recovery</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered student email address to receive an authentication verification token.
            </p>
          </div>

          {message && (
            <div
              className={`p-3.5 rounded text-xs font-semibold border ${
                message.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Dispatching Token…' : 'Send Password Reset Token'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Remembered your credentials?{' '}
            <Link href="/student/login" className="text-emerald-800 font-bold hover:underline">
              Sign in to portal &rarr;
            </Link>
          </div>
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
}
