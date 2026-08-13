'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Edit3,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  GraduationCap,
  Save,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';

export default function StudentProfilePage() {
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
      setLoading(true);
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
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
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
          <div className="w-12 h-12 rounded-full border-4 border-teal-700 border-t-transparent animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading student profile…</p>
        </div>
      </div>
    );
  }

  const isCoreUnlocked = student?.canEditRegistration;
  const isDemographicsLocked = remainingEdits === 0 && !isCoreUnlocked;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-8 text-slate-900">
      <StudentNavbar studentName={student?.fullName} matricNo={student?.matricNo} showBack={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{student?.fullName}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    student?.status === 'verified'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {student?.status === 'verified' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending Approval
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Matric No: <span className="font-mono font-bold text-teal-800">{student?.matricNo}</span> • Level: {student?.currentLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${
                remainingEdits > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
            >
              {remainingEdits > 0 ? (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{remainingEdits} of 2 edit attempts available</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Profile Locked (2/2 edits used)</span>
                </>
              )}
            </span>
          </div>
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

        {/* Profile Setup Form Card */}
        <div className="bg-white rounded-3xl shadow-xs border border-slate-200/90 p-6 sm:p-10 space-y-8">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-teal-600/30 bg-slate-100 flex items-center justify-center shadow-md">
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
                    htmlFor="profile-avatar-upload"
                    className="absolute -bottom-2 -right-2 bg-teal-800 hover:bg-teal-900 text-white p-2.5 rounded-xl shadow-md cursor-pointer transition-colors"
                    title="Upload Profile Avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                )}
                <input
                  id="profile-avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  disabled={isDemographicsLocked}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-3">
                {isDemographicsLocked ? 'Avatar photo locked' : 'Click camera icon to upload passport photo'}
              </p>
            </div>

            {/* Core Registration Fields Section */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Core Academic Details {isCoreUnlocked ? '(UNLOCKED BY ADMIN)' : '(LOCKED)'}</span>
                </h3>
                {(!isCoreUnlocked || isDemographicsLocked) && (
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="text-xs text-teal-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Correction / Unlock</span>
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
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isCoreUnlocked
                        ? 'bg-white border-teal-600 font-semibold text-slate-900'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Matriculation Number</label>
                  <input
                    type="text"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-mono ${
                      isCoreUnlocked
                        ? 'bg-white border-teal-600 font-semibold text-slate-900'
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
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isCoreUnlocked
                        ? 'bg-white border-teal-600 font-semibold text-slate-900'
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
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm ${
                      isCoreUnlocked
                        ? 'bg-white border-teal-600 font-semibold text-slate-900'
                        : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Demographic Setup Fields Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                Demographic Profile Details {isDemographicsLocked && '(LOCKED — 2/2 EDITS USED)'}
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none'
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
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || isDemographicsLocked}
              className={`w-full py-3.5 font-bold rounded-2xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2 ${
                isDemographicsLocked
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-teal-800 hover:bg-teal-900 text-white'
              }`}
            >
              {saving ? (
                'Saving Profile Setup…'
              ) : isDemographicsLocked ? (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Profile Locked (2 of 2 Edits Used)</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Setup ({remainingEdits} edit{remainingEdits === 1 ? '' : 's'} left)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <MobileBottomBar />

      {/* Unlock Request Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-teal-800" />
              <span>Request Registration Correction</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a written request explaining why you need to correct your registration or locked profile fields. If approved by admin, you will receive a temporary 24-hour edit window.
            </p>
            <form onSubmit={handleUnlockRequestSubmit} className="space-y-4">
              <textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="Explain the correction request in detail..."
                required
                rows={4}
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-700 focus:outline-none"
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
                  className="flex-1 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs"
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
