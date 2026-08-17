'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentNavbar } from '../../../components/StudentNavbar';
import { MobileBottomBar } from '../../../components/MobileBottomBar';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';

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
        <p className="text-xs font-semibold text-slate-500">Loading student profile…</p>
      </div>
    );
  }

  const isCoreUnlocked = student?.canEditRegistration;
  const isDemographicsLocked = remainingEdits === 0 && !isCoreUnlocked;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0 text-slate-900">
      <StudentNavbar studentName={student?.fullName} matricNo={student?.matricNo} showBack={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{student?.fullName}</h1>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  student?.status === 'verified'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {student?.status === 'verified' ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Matriculation: <span className="font-mono font-bold text-emerald-900">{student?.matricNo}</span> | Level: {student?.currentLevel}
            </p>
          </div>

          <div>
            <span
              className={`inline-block px-3 py-1 rounded text-xs font-bold border ${
                remainingEdits > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-100 border-slate-300 text-slate-600'
              }`}
            >
              {remainingEdits > 0
                ? `${remainingEdits} of 2 edit attempts available`
                : 'Profile Locked (2/2 edits used)'}
            </span>
          </div>
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

        {/* Profile Setup Form Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            {/* Avatar Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded overflow-hidden border-2 border-emerald-700/30 bg-slate-100 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-emerald-900 uppercase">
                      {student?.fullName ? student.fullName.substring(0, 2) : 'ST'}
                    </span>
                  )}
                </div>
                {!isDemographicsLocked && (
                  <label
                    htmlFor="profile-avatar-upload"
                    className="absolute -bottom-1 -right-1 bg-emerald-800 hover:bg-emerald-900 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    Change
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
              <p className="text-[11px] text-slate-400 mt-2">
                {isDemographicsLocked ? 'Passport photo locked' : 'Upload official student passport photograph'}
              </p>
            </div>

            {/* Core Registration Fields Section */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Core Admissions Data {isCoreUnlocked ? '(UNLOCKED BY ADMIN)' : '(LOCKED)'}
                </h2>
                {(!isCoreUnlocked || isDemographicsLocked) && (
                  <button
                    type="button"
                    onClick={() => setShowUnlockModal(true)}
                    className="text-xs text-emerald-800 font-bold hover:underline"
                  >
                    Request Correction / Unlock &rarr;
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isCoreUnlocked
                        ? 'bg-white border border-emerald-600 font-semibold text-slate-900'
                        : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Matriculation Number</label>
                  <input
                    type="text"
                    value={matricNo}
                    onChange={(e) => setMatricNo(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3 py-2 rounded text-xs font-mono ${
                      isCoreUnlocked
                        ? 'bg-white border border-emerald-600 font-semibold text-slate-900'
                        : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isCoreUnlocked
                        ? 'bg-white border border-emerald-600 font-semibold text-slate-900'
                        : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Admission Year</label>
                  <input
                    type="number"
                    value={admissionYear}
                    onChange={(e) => setAdmissionYear(Number(e.target.value))}
                    disabled={!isCoreUnlocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isCoreUnlocked
                        ? 'bg-white border border-emerald-600 font-semibold text-slate-900'
                        : 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Demographic Setup Fields Section */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                Demographic Profile Coordinates {isDemographicsLocked && '(LOCKED - 2/2 EDITS USED)'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State of Origin</label>
                  <input
                    type="text"
                    value={stateOfOrigin}
                    onChange={(e) => setStateOfOrigin(e.target.value)}
                    placeholder="e.g. Oyo State"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LGA of Origin</label>
                  <input
                    type="text"
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    placeholder="e.g. Ibadan North"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Religion</label>
                  <input
                    type="text"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    placeholder="e.g. Christianity / Islam"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    required
                    disabled={isDemographicsLocked}
                    className={`w-full px-3 py-2 rounded text-xs ${
                      isDemographicsLocked
                        ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none'
                    }`}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || isDemographicsLocked}
              className={`w-full py-2.5 font-bold rounded text-xs transition-colors ${
                isDemographicsLocked
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              {saving
                ? 'Saving Profile Coordinates…'
                : isDemographicsLocked
                ? 'Profile Locked (2 of 2 Edits Used)'
                : `Save Profile Setup (${remainingEdits} edit${remainingEdits === 1 ? '' : 's'} remaining)`}
            </button>
          </form>
        </div>
      </main>

      {/* Unlock Request Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-300 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Request Profile Field Unlock
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a formal request explaining why you need to correct your registration or locked profile coordinates. Upon approval by the Examination Officer, a temporary edit window will be granted.
            </p>
            <form onSubmit={handleUnlockRequestSubmit} className="space-y-3 text-xs">
              <textarea
                value={unlockReason}
                onChange={(e) => setUnlockReason(e.target.value)}
                placeholder="State the justification and specific fields requiring correction..."
                required
                rows={4}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  disabled={unlockSubmitting}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockSubmitting}
                  className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded"
                >
                  {unlockSubmitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileBottomBar />
      <InstitutionalFooter />
    </div>
  );
}
