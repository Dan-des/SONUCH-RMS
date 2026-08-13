import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ShieldCheck, UserCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 md:p-8 text-white">
      <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 md:p-10 text-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <img
            src="/logo.png"
            alt="School of Nursing UCH Shield"
            className="w-20 h-20 object-contain drop-shadow-xl"
          />
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              School of Nursing, UCH
            </h1>
            <p className="text-xs font-extrabold text-teal-400 uppercase tracking-widest mt-1">
              University College Hospital, Ibadan
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Result & Academic Records Management System (RMS)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-700/60 pt-6 space-y-3">
          <Link
            href="/student/login"
            className="w-full py-3.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Portal Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/student/register"
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>New Student Self-Registration</span>
          </Link>

          <Link
            href="/student/policies"
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Academic Regulations & Policy Handbook</span>
          </Link>

          <div className="pt-2 border-t border-slate-700/60">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              <span>Administrator & Staff Portal Access</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-700/60 pt-4 text-[11px] text-slate-400 font-medium">
          Official Institutional Portal • School of Nursing, UCH Ibadan
        </div>
      </div>
    </main>
  );
}
