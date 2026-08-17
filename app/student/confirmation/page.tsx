import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { InstitutionalFooter } from '../../../components/InstitutionalFooter';

export const metadata: Metadata = {
  title: 'Registration Submitted Successfully | School of Nursing, UCH Ibadan',
  description:
    'Official acknowledgement receipt and verification guidance for newly registered student nurses at University College Hospital, Ibadan.',
};

export default function RegistrationConfirmationPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Header */}
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
            Go to Student Sign In
          </Link>
        </div>
      </header>

      {/* Main Confirmation Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-10 space-y-6">
          <div className="text-center space-y-2 border-b border-slate-100 pb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto text-lg font-bold">
              ✓
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Registration Submitted Successfully
            </h1>
            <p className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
              Record Acknowledged &bull; Pending Administrative Verification
            </p>
          </div>

          <div className="text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
            <p>
              Thank you for completing your student profile on the Results Management System of the School of Nursing, University College Hospital, Ibadan.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">Next Steps in the Verification Workflow:</p>
              <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
                <li>Your submitted matriculation number and admissions biodata will be cross-referenced against the official admission list by the Examination and Records unit.</li>
                <li>Once verified by the administrator, your account status will transition from <strong>Pending</strong> to <strong>Active</strong>.</li>
                <li>You may log in to the student portal at any time to check your verification status, view published grading policies, and access semester result sheets.</li>
              </ol>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                href="/student/login"
                className="flex-1 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-center text-xs font-bold transition-colors"
              >
                Proceed to Portal Login
              </Link>
              <Link
                href="/student/policies"
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 text-center text-xs font-bold transition-colors"
              >
                Read Academic Regulations
              </Link>
            </div>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
