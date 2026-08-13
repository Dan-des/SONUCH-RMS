'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Demographic setup state
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [lga, setLga] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('Nigerian');
  const [religion, setReligion] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Unlocked Core Editable Fields
  const [fullName, setFullName] = useState('');
  const [matricNo, setMatricNo] = useState('');
  const [email, setEmail] = useState('');
  const [admissionYear, setAdmissionYear] = useState(2026);

  // Edit limits state
  const [remainingEdits, setRemainingEdits] = useState(2);
  const [profileEditsCount, setProfileEditsCount] = useState(0);

  // Unlock Request Modal state
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockReason, setUnlockReason] = useState('');
  const [unlockSubmitting, setUnlockSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/student/profile');
      const data = await res.json();
      if (res.ok && data.student) {
        setStudent(data.student);
        setStateOfOrigin(data.student.stateOfOrigin || '');
        setLga(data.student.lga || '');
        setDateOfBirth(data.student.dateOfBirth || '');
        setNationality(data.student.nationality || 'Nigerian');
        setReligion(data.student.religion || '');
        setPhone(data.student.phone || '');
        setAvatarUrl(data.student.avatarUrl || '');

        setFullName(data.student.fullName || '');
        setMatricNo(data.student.matricNo || '');
        setEmail(data.student.email || '');
        setAdmissionYear(data.student.admissionYear || 2026);

        setRemainingEdits(data.student.remainingEdits ?? 2);
        setProfileEditsCount(data.student.profileEditsCount ?? 0);

        // If student is verified, redirect to dashboard automatically
        if (data.student.status === 'verified') {
          router.push('/student/dashboard');
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      router.push('/student/login');
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const payload: any = {
        stateOfOrigin,
        lga,
        dateOfBirth,
        nationality,
        religion,
        phone,
        avatarUrl,
      };

      if (student?.canEditRegistration) {
        payload.fullName = fullName;
        payload.matricNo = matricNo;
        payload.email = email;
        payload.admissionYear = admissionYear;
      }

      const res = await fetch('/api/student/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setFeedback({ type: 'success', message: data.message });
      fetchProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUnlockRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/student/unlock-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: unlockReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setFeedback({ type: 'success', message: data.message });
      setShowUnlockModal(false);
      setUnlockReason('');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUnlockSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading student profile…</p>
        </div>
      </div>
    );
  }

  const isCoreUnlocked = student?.canEditRegistration;
  const isDemographicsLocked = remainingEdits === 0 && !isCoreUnlocked;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-start pb-12">
      {/* Top Sticky Header with Logout */}
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="School of Nursing UCH Shield"
            className="w-9 h-9 object-contain drop-shadow-sm"
          />
          <div>
            <h1 className="text-sm font-black text-slate-800">SONUCH RMS</h1>
            <p className="text-[11px] text-slate-500 font-semibold">
              School of Nursing, UCH Ibadan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold rounded-full">
            Verification Pending
          </span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl px-4 mt-6 space-y-6">
        {/* Pending Verification Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">
            !
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-extrabold text-amber-900">Account Pending Verification</h2>
            <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
              Your profile is currently awaiting admin verification. Complete your demographic setup below.
              Access to academic grade cards and transcript exports will unlock automatically upon admin verification.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold text-center border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Centered Profile Setup Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-10 space-y-8">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-slate-800">Student Profile Setup</h1>
            <p className="text-xs text-slate-500 font-semibold">
              School of Nursing, UCH • {student?.currentLevel} ({student?.matricNo})
            </p>

            {/* Profile Edit Counter Badge */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
                  remainingEdits > 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                {remainingEdits > 0
                  ? `✏️ ${remainingEdits} of 2 profile edit attempt${remainingEdits === 1 ? '' : 's'} remaining`
                  : '🔒 Profile setup locked (2 of 2 edits used)'}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Centered Circular Avatar Component */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-emerald-500/30 bg-slate-100 flex items-center justify-center shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-emerald-700 uppercase">
                      {student?.fullName ? student.fullName.substring(0, 2) : 'ST'}
                    </span>
                  )}
                </div>
                {!isDemographicsLocked && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-full shadow-md cursor-pointer transition-colors"
                    title="Upload Profile Avatar"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  disabled={isDemographicsLocked}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                {isDemographicsLocked ? 'Avatar photo locked' : 'Click icon to upload photo'}
              </p>
            </div>

            {/* Core Registration Fields Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Core Registration Details {isCoreUnlocked ? '(UNLOCKED FOR EDIT)' : '(LOCKED)'}
                </h3>
                {(!isCoreUnlocked || isDemographicsLocked) && (
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    Request Correction / Unlock
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm ${
                      isCoreUnlocked
                        ? 'bg-white border-emerald-400 font-semibold'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Matriculation No</label>
                  <input
                    type="text"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm font-mono ${
                      isCoreUnlocked
                        ? 'bg-white border-emerald-400 font-semibold'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm ${
                      isCoreUnlocked
                        ? 'bg-white border-emerald-400 font-semibold'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Admission Year</label>
                  <input
                    type="number"
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(Number(e.target.value))}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3.5 py-2 rounded-xl text-sm ${
                      isCoreUnlocked
                        ? 'bg-white border-emerald-400 font-semibold'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Demographic Setup Fields Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">
                Demographic Profile Information {isDemographicsLocked && '(LOCKED — 2/2 EDITS USED)'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State of Origin</label>
                  <input
                    type="text"
                    value={stateOfOrigin}
                    onChange={(e) => setStateOfOrigin(e.target.value)}
                    placeholder="e.g. Oyo State"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LGA of Origin</label>
                  <input
                    type="text"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    placeholder="e.g. Ibadan North"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    placeholder="e.g. Christianity / Islam"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || isDemographicsLocked}
              className={`w-full py-3.5 font-bold rounded-2xl text-sm shadow-md transition-colors duration-150 ${
                isDemographicsLocked
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {saving
                ? 'Saving Profile Setup…'
                : isDemographicsLocked
                ? 'Profile Locked (Edit Limit Reached)'
                : 'Save Profile Setup'}
            </button>
          </form>
        </div>
      </main>

      {/* Unlock Request Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800">Request Registration Correction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a written request explaining why you need to correct your registration or locked profile fields. If approved by admin, you will receive a temporary edit window.
            </p>
            <form onSubmit={handleUnlockRequestSubmit} className="space-y-4">
              <textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Explain the correction request in detail..."
                required
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  disabled={unlockSubmitting}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockSubmitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
                >
                  {unlockSubmitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
