'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.png" alt="SONUCH Logo" className="h-16 w-auto object-contain mb-2" />
          <h1 className="text-xl font-extrabold text-slate-800">Forgot Password</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Enter your registered student email address to receive a 6-digit verification code.
          </p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Registered Email Address
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-colors"
          >
            {loading ? 'Sending Code…' : 'Send Reset Verification Code'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Remembered password?{' '}
          <Link href="/student/login" className="text-emerald-700 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
