import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { InstitutionalFooter } from '../../components/InstitutionalFooter';

export const metadata: Metadata = {
  title: 'Student Data Privacy Policy | School of Nursing, UCH Ibadan',
  description:
    'Official Student Data Privacy Policy under the Nigeria Data Protection Act (NDPA) and NMCN guidelines for the School of Nursing, University College Hospital, Ibadan.',
};

export default function PrivacyPolicyPage() {
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
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Legal & Regulatory Compliance</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Academic Data Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Effective Date: Academic Session 2026/2027 | Last Revised: August 2026 | Document Ref: SON/UCH/DPA/2026/01
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Regulatory Framework & Purpose</h2>
            <p>
              The School of Nursing, University College Hospital (UCH), Ibadan is committed to safeguarding the confidentiality, accuracy, and security of student academic records. This policy adheres to the provisions of the <strong>Nigeria Data Protection Act (NDPA) 2023</strong> and the regulatory directives of the <strong>Nursing and Midwifery Council of Nigeria (NMCN)</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Categories of Information Collected</h2>
            <p>
              The Results Management System (RMS) processes the following categories of personal and educational data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Student Biodata:</strong> Full Legal Name, Matriculation Number, Date of Birth, Gender, State of Origin, Local Government Area, and Passport Photograph.</li>
              <li><strong>Contact Coordinates:</strong> Verified Email Address, Phone Number, and Residential Postal Address.</li>
              <li><strong>Academic & Clinical Records:</strong> Continuous Assessment (CA) scores, Terminal Examination scores, Letter Grades, Quality Points, Grade Point Averages (GPA/CGPA), and Hospital Ward Posting logs.</li>
              <li><strong>System Audit Logs:</strong> Timestamped IP access logs, authentication timestamps, and session identifiers.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Purpose and Legal Basis for Processing</h2>
            <p>
              Personal and academic records are processed exclusively for:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
              <li>Authenticating student identity and granting secure portal access.</li>
              <li>Computing semester GPAs, cumulative CGPAs, and academic classifications.</li>
              <li>Generating certified official Statements of Results for professional NMCN indexing and council examinations.</li>
              <li>Maintaining immutable institutional archives and statutory reporting.</li>
            </ol>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Data Security & Cryptographic Safeguards</h2>
            <p>
              Academic records are protected using industry-standard technical measures:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Passwords are cryptographically salted and hashed using bcrypt.</li>
              <li>Session authentication uses HttpOnly, SameSite=Lax, and Secure cookie tokens.</li>
              <li>Administrative access requires Master Key UUID verification and single-use 6-digit OTP codes.</li>
              <li>All database transmissions are encrypted in transit over TLS 1.3.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">5. Student Rights Under Data Protection Law</h2>
            <p>
              Enrolled students retain the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Inspect and view their complete semester grade breakdowns and transcripts at any time.</li>
              <li>Request correction of erroneous biodata via the official institutional Unlock Appeal procedure.</li>
              <li>Receive certified digital Statement of Results with institutional cryptographic verification hash.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">6. Data Protection Officer & Inquiries</h2>
            <p>
              For data protection inquiries or to report an unauthorized access concern, contact:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">Office of the Academic Registrar / Data Protection Desk</p>
              <p>School of Nursing, University College Hospital (UCH)</p>
              <p>Queen Elizabeth Road, Oritamefa, P.M.B. 5116, Ibadan, Oyo State, Nigeria</p>
              <p>Email: son@uch-ibadan.org.ng | Telephone: +234 (0) 2 241 0088</p>
            </div>
          </div>
        </section>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
