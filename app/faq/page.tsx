'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { InstitutionalFooter } from '../../components/InstitutionalFooter';

const FAQ_ITEMS = [
  {
    category: 'Grading & Academic Regulations',
    q: 'What is the official grading scale and pass mark at School of Nursing, UCH?',
    a: 'The School of Nursing, University College Hospital operates on a 5.00 Cumulative Grade Point Average (CGPA) scale following NMCN standards. Total score is derived from Continuous Assessment (CA: 30%) and Terminal Examination (70%). The minimum pass mark for all Nursing professional courses is 50% (Letter Grade C, 3.00 Grade Points). A score below 50% constitutes a fail (Grade F, 0.00 GP).',
  },
  {
    category: 'Grading & Academic Regulations',
    q: 'How is the Cumulative Grade Point Average (CGPA) computed?',
    a: 'For each course, Quality Points (QP) are calculated by multiplying the Course Credit Units by the Grade Point earned (e.g. 3 Units × 5.0 GP for an A = 15.0 QP). The Semester GPA is calculated by dividing Total Quality Points by Total Registered Credit Units. The CGPA represents the cumulative average of quality points across all completed semesters.',
  },
  {
    category: 'Admissions & Account Verification',
    q: 'How do newly admitted students register and activate their portal access?',
    a: 'New students must complete the self-registration form with their Full Name, assigned Matriculation Number (e.g. UCH/NUR/2026/001), personal email address, and admission year. Upon submission, the account is placed in a pending verification status. The Academic Administration verifies the student credentials against the official admissions roster to grant active portal privileges.',
  },
  {
    category: 'Admissions & Account Verification',
    q: 'What should I do if I entered incorrect biodata during profile setup?',
    a: 'Students are permitted two (2) self-edit chances on their profile page to correct demographic details. Once locked, students must submit a formal digital Unlock Appeal through the profile page, stating the justification and fields requiring correction. The Academic Administration reviews and approves 24-hour editing windows.',
  },
  {
    category: 'Results & Examination Statements',
    q: 'Why are examination results locked with a countdown timer?',
    a: 'The Academic Examination Committee configures automated release gates to synchronize the release of results for entire class cohorts following formal board ratification. Once the timer reaches zero, results unlock automatically for verified students.',
  },
  {
    category: 'Results & Examination Statements',
    q: 'How do I download and print my Certified Statement of Results (PDF)?',
    a: 'Log in to the Student Portal, navigate to Results, select the academic session/level, and click "Print Official Statement (PDF)". The generated document contains the institutional crest, verified student metadata, course breakdowns, and official signature certification blocks.',
  },
  {
    category: 'Security & Password Assistance',
    q: 'How do I reset my portal password if forgotten?',
    a: 'Navigate to the Student Login page and click "Forgot password?". Enter your registered email address to receive a secure 6-digit One-Time Password (OTP). Enter the OTP code on the verification screen to set a new password.',
  },
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All Categories', 'Grading & Academic Regulations', 'Admissions & Account Verification', 'Results & Examination Statements', 'Security & Password Assistance'];

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

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
            Student Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Student & Faculty Guidance</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Answers to common questions regarding student verification, NMCN 5.00 CGPA grading rules, examination statements, and portal usage.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions or keywords..."
              className="w-full sm:flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-900 focus:outline-none"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-64 px-3 py-2.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded p-8 text-center text-xs text-slate-500">
              No questions found matching your search query.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => (
              <article key={idx} className="bg-white border border-slate-200 rounded-lg p-5 space-y-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  {faq.category}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">{faq.q}</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{faq.a}</p>
              </article>
            ))
          )}
        </div>

        {/* Contact Helpdesk Box */}
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Still require assistance?</h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Contact the Academic Helpdesk or visit the School of Nursing administrative complex.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
          >
            Contact Helpdesk & Directions
          </Link>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
