import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { InstitutionalFooter } from '../../components/InstitutionalFooter';

export const metadata: Metadata = {
  title: 'Campus Location, Directions & Contact Helpdesk | School of Nursing, UCH Ibadan',
  description:
    'Official physical location, transit directions, interactive campus map, and contact directories for the School of Nursing, University College Hospital, Ibadan, Nigeria.',
};

export default function ContactLocationPage() {
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

      {/* Main Content Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-slate-200 pb-6 space-y-2">
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Campus Information & Helpdesk</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Location, Directions & Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Physical coordinates, administrative desks, and navigational directions to the School of Nursing Complex within the University College Hospital, Ibadan.
          </p>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Official Postal Address */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Physical & Postal Address
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 space-y-1.5 leading-relaxed">
              <p className="font-bold text-slate-900">School of Nursing Administrative Complex</p>
              <p>University College Hospital (UCH)</p>
              <p>Queen Elizabeth Road, Oritamefa</p>
              <p>P.M.B. 5116, Ibadan, Oyo State, Nigeria</p>
              <p className="pt-2 text-slate-500">
                Landmarks: Opposite UCH Main Gate, adjacent to College of Medicine Auditorium.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Official Contact Desks</h3>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li><strong>Academic Registrar:</strong> son@uch-ibadan.org.ng</li>
                <li><strong>Examination & Records Office:</strong> exams.records@sonuch.edu.ng</li>
                <li><strong>Portal IT Support Desk:</strong> support@sonuch.edu.ng</li>
                <li><strong>General Switchboard:</strong> +234 (0) 2 241 0088 / +234 (0) 2 241 0015</li>
              </ul>
            </div>
          </div>

          {/* Card 2: Operating Hours & Transit Guidance */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
              Transit & Navigational Directions
            </h2>
            <div className="text-xs sm:text-sm text-slate-700 space-y-3">
              <div>
                <p className="font-bold text-slate-900">From Iwo Road Interchange (East Axis):</p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Board commercial transit heading towards Agodi Gate / Total Garden. At Total Garden roundabout, proceed along Queen Elizabeth Road for 400 meters. The UCH Main Entrance is on the right.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-900">From Dugbe / Railway Terminal (West Axis):</p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Take Mokola Roundabout axis through Secretariat Road to Total Garden roundabout, then turn onto Queen Elizabeth Road.
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-900">Office Working Hours:</p>
                <p className="text-slate-600 text-xs mt-0.5">
                  Monday - Friday: 08:00 AM - 04:00 PM (West Africa Time)<br />
                  Closed on Public Holidays and Weekends.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Map Section */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Interactive Campus Map: UCH Ibadan Complex
            </h2>
            <a
              href="https://maps.google.com/?q=University+College+Hospital+Ibadan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              Open in Google Maps &rarr;
            </a>
          </div>

          <div className="w-full h-80 bg-slate-100 border border-slate-200 rounded overflow-hidden">
            <iframe
              title="Map Location of University College Hospital, Ibadan"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3956.4025064560195!2d3.9015096758451877!3d7.40838199260173!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103993427976e10f%3A0x6b44558e4d3dbec6!2sUniversity%20College%20Hospital%20Ibadan!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </main>

      <InstitutionalFooter />
    </div>
  );
}
