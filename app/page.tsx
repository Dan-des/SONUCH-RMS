import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { InstitutionalFooter } from '../components/InstitutionalFooter';

export const metadata: Metadata = {
  title: 'School of Nursing, University College Hospital (UCH) | Results Management System',
  description:
    'Official Results & Academic Records Portal of the School of Nursing, University College Hospital, Ibadan. Student self-registration, verified semester results, and academic grading regulations.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Institutional Banner Header */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Official Seal of the School of Nursing, University College Hospital, Ibadan"
              className="w-11 h-11 object-contain"
            />
            <div>
              <p className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                School of Nursing, UCH
              </p>
              <p className="text-[11px] text-emerald-900 font-semibold tracking-wide">
                University College Hospital, Ibadan, Nigeria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/login"
              className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-semibold transition-colors"
            >
              Faculty / Admin Access
            </Link>
            <Link
              href="/student/login"
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-bold transition-colors"
            >
              Student Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Gateway Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded inline-block">
            Official Academic Records Gateway
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Results & Academic Records Management System
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            School of Nursing, University College Hospital, Ibadan - Established 1952. Secure semester grade processing, continuous assessment records, and NMCN-certified statement generation.
          </p>
        </div>

        {/* 2-Column Primary Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Student Services */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Student Portal & Registration</h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                  Students
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access your verified semester grade sheets, track continuous assessment scores, verify admission status, and print certified statements of results.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/student/login"
                className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-center text-xs font-bold transition-colors block"
              >
                Sign In to Student Account
              </Link>
              <Link
                href="/student/register"
                className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded text-center text-xs font-semibold transition-colors block"
              >
                New Student Self-Registration
              </Link>
            </div>
          </div>

          {/* Card 2: Faculty & Administration */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900">Faculty & Examination Board</h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                  Staff Only
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manage student admissions verification, upload Continuous Assessment (CA 30) & Exam (70) scores, ratify grade sheets, and configure 5.00 CGPA grading policies.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href="/admin/login"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded text-center text-xs font-bold transition-colors block"
              >
                Enter Administrator Control Center
              </Link>
              <Link
                href="/student/policies"
                className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded text-center text-xs font-semibold transition-colors block"
              >
                View Published Grading Scale & Policies
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Information & Quick Navigation Strip */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Institutional Information & Resources
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Link
              href="/student/policies"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-800 font-semibold transition-colors text-center"
            >
              Academic Policy
            </Link>
            <Link
              href="/faq"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-800 font-semibold transition-colors text-center"
            >
              Portal FAQ
            </Link>
            <Link
              href="/contact"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-800 font-semibold transition-colors text-center"
            >
              Campus Location
            </Link>
            <Link
              href="/privacy"
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-slate-800 font-semibold transition-colors text-center"
            >
              Data Privacy
            </Link>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
