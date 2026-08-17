import React from 'react';
import Link from 'next/link';
import { InstitutionalFooter } from '../components/InstitutionalFooter';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
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
            href="/"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors"
          >
            Portal Home
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-16 flex flex-col justify-center text-center space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-10 space-y-5">
          <p className="text-xs font-bold text-red-700 uppercase tracking-widest">HTTP 404 - Document Not Found</p>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Requested Resource Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The page or document address you requested does not exist on the Results Management System or has been archived by the Academic Board.
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-bold transition-colors"
            >
              Return to Portal Home
            </Link>
            <Link
              href="/faq"
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 text-xs font-bold transition-colors"
            >
              View Helpdesk & FAQs
            </Link>
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
