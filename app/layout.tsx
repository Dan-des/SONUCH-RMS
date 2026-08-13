import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { CommandPalette } from '../components/CommandPalette';

export const metadata: Metadata = {
  title: 'SONUCH RMS — School of Nursing, University College Hospital',
  description: 'College of Nursing Academic & Record Management System',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
