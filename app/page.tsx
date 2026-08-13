import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldCheck, UserCheck, Lock } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 text-slate-900">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-xl p-8 md:p-10 text-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <img
            src="/logo.png"
            alt="School of Nursing UCH Shield"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              School of Nursing, UCH
            </h1>
            <p className="text-xs font-black text-teal-800 uppercase tracking-widest mt-1">
              University College Hospital, Ibadan
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Result & Academic Records Management System (RMS)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <Link
            href="/student/login"
            className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Portal Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/student/register"
            className="w-full py-3.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>New Student Self-Registration</span>
          </Link>

          <Link
            href="/student/policies"
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-200"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Academic Regulations & Policy Handbook</span>
          </Link>

          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-800 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Administrator & Staff Portal Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 font-medium">
          Official Institutional Portal • School of Nursing, UCH Ibadan
        </div>
      </div>
    </main>
  );
}
