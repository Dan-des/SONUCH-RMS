'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Lock,
  Edit3,
  LogOut,
  Camera,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

export default function StudentPendingPage() {
  const router = useRouter();

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

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

    // Auto-check verification status every 5 seconds
    const interval = setInterval(() => {
      fetchProfile(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async (isBackground = false) => {
    try {
      if (!isBackground) setCheckingStatus(true);
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

        // If admin verified the student in DB, automatically navigate to student dashboard!
        if (data.student.status === 'verified') {
          window.location.href = '/student/dashboard';
        }
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      if (!isBackground) {
        setLoading(false);
        setCheckingStatus(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // Force full window navigation to purge cached session cookies & state completely
      window.location.href = '/student/login';
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
      {/* Top Sticky Header with Institutional Brand Logo & Logout */}
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
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            Verification Pending
          </span>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            Log Out
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl px-4 mt-6 space-y-6">
        {/* Pending Verification Notice */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-sm mt-0.5">
              <AlertCircle className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-amber-900">Account Pending Verification</h2>
              <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
                Your account is currently awaiting admin verification. Complete your profile setup below while you await approval.
              </p>
            </div>
          </div>

          <button
            onClick={() => fetchProfile()}
            disabled={checkingStatus}
            className="px-3.5 py-2 bg-amber-200 hover:bg-amber-300 text-amber-900 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap self-end sm:self-center shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingStatus ? 'animate-spin' : ''}`} />
            <span>Check Status</span>
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold text-center border flex items-center justify-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{feedback.message}</span>
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
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold border ${
                  remainingEdits > 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-100 border-slate-300 text-slate-600'
                }`}
              >
                {remainingEdits > 0 ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{remainingEdits} of 2 profile edit attempt{remainingEdits === 1 ? '' : 's'} remaining</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Profile setup locked (2 of 2 edits used)</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Centered Circular Avatar Component */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-teal-600/30 bg-slate-100 flex items-center justify-center shadow-lg">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-teal-800 uppercase">
                      {student?.fullName ? student.fullName.substring(0, 2) : 'ST'}
                    </span>
                  )}
                </div>
                {!isDemographicsLocked && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-teal-700 hover:bg-teal-800 text-white p-2.5 rounded-full shadow-md cursor-pointer transition-colors"
                    title="Upload Profile Avatar"
                  >
                    <Camera className="w-4 h-4" />
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
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Core Registration Details {isCoreUnlocked ? '(UNLOCKED FOR EDIT)' : '(LOCKED)'}
                </h3>
                {(!isCoreUnlocked || isDemographicsLocked) && (
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
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
                        ? 'bg-white border-teal-500 font-semibold'
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
                        ? 'bg-white border-teal-500 font-semibold'
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
                        ? 'bg-white border-teal-500 font-semibold'
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
                        ? 'bg-white border-teal-500 font-semibold'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || isDemographicsLocked}
              className={`w-full py-3.5 font-bold rounded-2xl text-sm shadow-md transition-colors duration-150 flex items-center justify-center gap-2 ${
                isDemographicsLocked
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {saving ? (
                'Saving Profile Setup…'
              ) : isDemographicsLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Profile Locked (Edit Limit Reached)</span>
                </>
              ) : (
                'Save Profile Setup'
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Unlock Request Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-700" />
              <span>Request Registration Correction</span>
            </h3>
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
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-600 focus:outline-none"
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
                  className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl"
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
