'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  KeyRound,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/admin-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request OTP');
      }

      setFeedback({ type: 'success', message: data.message });
      setStep('otp');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/admin-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      setFeedback({ type: 'success', message: 'OTP verified successfully! Access granted.' });
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/admin/dashboard';
      }, 500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          {/* Institutional Shield Logo */}
          <div className="flex items-center justify-center mb-1">
            <img
              src="/logo.png"
              alt="School of Nursing UCH Shield"
              className="w-16 h-16 object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-xl font-black text-slate-900">Administrator Portal</h1>
          <p className="text-xs text-slate-500 font-medium">
            School of Nursing, UCH Ibadan • Secure Two-Factor Authentication
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sonuch.edu.ng"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-teal-700 focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Sending Verification OTP…' : 'Send Verification OTP'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-xs text-teal-800 font-bold hover:underline"
                >
                  Change Email
                </button>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-2xl font-mono font-bold tracking-widest text-teal-900 focus:ring-2 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Verifying OTP Code…' : 'Verify & Enter Control Center'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
