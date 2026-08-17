import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { CommandPalette } from '../components/CommandPalette';

export const metadata: Metadata = {
  metadataBase: new URL('https://sonuch-rms.vercel.app'),
  title: {
    default: 'School of Nursing, University College Hospital (UCH) | Results Management System',
    template: '%s | School of Nursing, UCH Ibadan',
  },
  description:
    'Official Results and Academic Records Management System for the School of Nursing, University College Hospital, Ibadan, Nigeria. Certified semester transcript generation, course registration, and examination grade records.',
  keywords: [
    'School of Nursing UCH',
    'University College Hospital Ibadan',
    'SONUCH RMS',
    'Nursing Results Portal',
    'UCH Nursing Examination Grades',
    'Basic Nursing RN Ibadan',
  ],
  authors: [{ name: 'School of Nursing, UCH Ibadan' }],
  creator: 'School of Nursing, University College Hospital, Ibadan',
  publisher: 'University College Hospital (UCH), Ibadan',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://sonuch-rms.vercel.app',
    title: 'School of Nursing, UCH Ibadan | Result Management System',
    description:
      'Official academic records portal and certified examination result processing for student nurses at University College Hospital, Ibadan.',
    siteName: 'SONUCH RMS',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Official Institutional Seal of School of Nursing, University College Hospital, Ibadan',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'School of Nursing, UCH Ibadan | Result Management System',
    description: 'Official student academic records and results verification portal for UCH School of Nursing.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#064e3b" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
