'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function InstitutionalFooter() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'School of Nursing, UCH Ibadan | Result Management System',
      text: 'Official Result and Academic Record Management System for School of Nursing, University College Hospital, Ibadan.',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://sonuch-rms.vercel.app',
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or share not allowed
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Institutional Identification */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Official Seal of School of Nursing, University College Hospital, Ibadan"
                className="w-10 h-10 object-contain"
              />
              <div>
                <p className="font-bold text-white text-sm">School of Nursing</p>
                <p className="text-[11px] text-slate-400">University College Hospital, Ibadan</p>
              </div>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Established in 1952. Approved by the Nursing and Midwifery Council of Nigeria (NMCN). Committed to clinical excellence and nursing leadership.
            </p>
            <div className="pt-1">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 text-[11px] font-semibold transition-colors"
                type="button"
              >
                {copied ? 'Link Copied to Clipboard' : 'Share Portal Link'}
              </button>
            </div>
          </div>

          {/* Col 2: Academic Portals */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Academic Portals</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/student/login" className="hover:text-emerald-400 transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link href="/student/register" className="hover:text-emerald-400 transition-colors">
                  New Student Self-Registration
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-emerald-400 transition-colors">
                  Faculty & Administrator Login
                </Link>
              </li>
              <li>
                <Link href="/student/courses" className="hover:text-emerald-400 transition-colors">
                  Registered Curriculum Catalogue
                </Link>
              </li>
              <li>
                <Link href="/student/results" className="hover:text-emerald-400 transition-colors">
                  Certified Statement Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academic Policies & Guidance */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Policies & Guidance</p>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <Link href="/student/policies" className="hover:text-emerald-400 transition-colors">
                  Academic Regulations & Grading Scale
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Student Data Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Portal Usage
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Campus Location & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Address & Inquiries */}
          <div className="space-y-2.5">
            <p className="font-bold text-white uppercase tracking-wider text-[11px]">Campus Contact</p>
            <div className="text-slate-400 text-[11px] space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-200">School of Nursing Complex</p>
              <p>University College Hospital (UCH)</p>
              <p>Queen Elizabeth Road, Oritamefa</p>
              <p>P.M.B. 5116, Ibadan, Oyo State, Nigeria</p>
              <p className="pt-1.5 text-slate-300">Email: son@uch-ibadan.org.ng</p>
              <p className="text-slate-300">Desk: +234 (0) 2 241 0088</p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} School of Nursing, University College Hospital, Ibadan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <span>|</span>
            <Link href="/faq" className="hover:text-white transition-colors">Help</Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-white transition-colors">Location</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default InstitutionalFooter;
