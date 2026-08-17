import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { InstitutionalFooter } from '../../components/InstitutionalFooter';

export const metadata: Metadata = {
  title: 'Terms of Portal Usage & Academic Integrity | School of Nursing, UCH Ibadan',
  description:
    'Official Terms of Service, portal usage regulations, examination integrity rules, and electronic certification terms for the School of Nursing, University College Hospital, Ibadan.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="School of Nursing UCH Official Crest"
              className="w-9 h-9 object-contain"
            />
            <div>
              <p className="font-bold text-sm text-slate-900 leading-tight">School of Nursing, UCH</p>
              <p className="text-[11px] text-slate-500">University College Hospital, Ibadan</p>
            </div>
          </Link>
          <Link
            href="/student/login"
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold transition-colors"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Main Document Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Institutional Governance</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms of Portal Usage & Academic Regulations
          </h1>
          <p className="text-xs text-slate-500">
            Applicable to: Enrolled Students, Faculty Members, and Examination Officers | Session 2026/2027
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or creating an account on the School of Nursing, University College Hospital (UCH) Results Management System (RMS), you agree to comply with and be bound by these Terms of Usage, the Nursing and Midwifery Council of Nigeria (NMCN) code of professional conduct, and the institution&apos;s Academic Regulations.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Student Credential & Account Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Students must register using their official matriculation number and a valid personal email address.</li>
              <li>Account credentials (passwords, OTPs, session keys) are strictly confidential and non-transferable.</li>
              <li>Sharing portal credentials with unauthorized individuals is an offense subject to disciplinary review by the Academic Board.</li>
              <li>Newly registered accounts remain in a pending verification status until physically/electronically confirmed by the school administration.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Examination Conduct & Grade Processing</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>All examination scores are evaluated out of 100 points: Continuous Assessment (CA) accounts for 30 points and Terminal Examination accounts for 70 points.</li>
              <li>The institutional pass mark for professional nursing courses is 50% (Grade C, 3.00 Grade Points).</li>
              <li>Grades published on this portal are official after formal approval by the Academic Board and Examination Committee.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Certified PDF Statements of Results</h2>
            <p>
              Electronic Statements of Results generated through this portal are certified digital copies. Any unauthorized alteration, digital forgery, or falsification of grades on generated PDF certificates constitutes academic fraud and will result in immediate expulsion and referral to law enforcement and the NMCN Disciplinary Tribunal.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability & Service Continuity</h2>
            <p>
              The School of Nursing, UCH strives to ensure 99.9% portal uptime. Scheduled maintenance, server upgrades, or result lock periods configured under official examination schedules do not constitute service failure.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Governing Law</h2>
            <p>
              These terms are governed by the Laws of the Federal Republic of Nigeria and the regulations of the Nursing and Midwifery Council of Nigeria (NMCN).
            </p>
          </div>
        </section>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
