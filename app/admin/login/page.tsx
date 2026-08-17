'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';

export default function AdminLoginPage() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [accessKey, setAccessKey] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingKey, setRequestingKey] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/admin-otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          accessKey: accessKey.trim(),
        }),
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

  const handleRequestMasterKey = async () => {
    if (!email || !email.includes('@')) {
      setFeedback({
        type: 'error',
        message: 'Please enter your administrator email address in the field below first.',
      });
      return;
    }

    setRequestingKey(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/auth/admin-otp/request-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request key');
      }

      setFeedback({ type: 'success', message: data.message });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setRequestingKey(false);
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

      setFeedback({ type: 'success', message: 'OTP verified successfully! Redirecting...' });
      window.location.href = data.redirectUrl || '/admin/dashboard';
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
            <h1 className="text-lg font-bold text-slate-900">Administrator Portal Sign In</h1>
            <p className="text-xs text-slate-500 font-medium">
              School of Nursing, UCH Ibadan | Master Key Two-Factor Authentication
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

          {step === 'credentials' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    Master Admin Access Key (UUID)
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestMasterKey}
                    disabled={requestingKey}
                    className="text-xs text-emerald-800 font-bold hover:underline disabled:opacity-50"
                  >
                    {requestingKey ? 'Sending Key…' : 'Request Key via Email &rarr;'}
                  </button>
                </div>

                <input
                  type="text"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="e.g. UCH-8mK3p-W9xLv-2qNzT-5bRyH-7jFdC"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sonuch.edu.ng"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !accessKey.trim() || !email.trim()}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Validating Key & Sending OTP…' : 'Authenticate & Request OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wider">
                    6-Digit Verification Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Edit Credentials
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded text-center text-xl font-mono font-bold tracking-widest text-emerald-900 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Enter the verification code sent to <strong className="text-slate-700">{email}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying OTP Code…' : 'Verify & Enter Control Center'}
              </button>
            </form>
          )}

          <div className="text-center pt-3 border-t border-slate-100 text-xs">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-900 font-medium"
            >
              &larr; Back to Portal Gateway
            </Link>
          </div>
        </div>
      </div>

      <InstitutionalFooter />
    </div>
  );
}
