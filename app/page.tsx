import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-10 text-center space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <img
            src="/logo.png"
            alt="School of Nursing UCH Shield"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              School of Nursing, UCH
            </h1>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest mt-1">
              University College Hospital, Ibadan
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Result & Academic Records Management System (RMS)
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-3">
          <Link
            href="/student/register"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Student Registration / Login</span>
            <span>→</span>
          </Link>

          <Link
            href="/student/policies"
            className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <span>Academic Policy Handbook</span>
          </Link>

          <Link
            href="/admin/verification"
            className="block text-xs font-bold text-slate-400 hover:text-emerald-700 pt-2 transition-colors"
          >
            Staff & Administrative Portal Access
          </Link>
        </div>

        <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 font-medium">
          Official Academic Portal • Powered by Next.js & MongoDB
        </div>
      </div>
    </main>
  );
}
