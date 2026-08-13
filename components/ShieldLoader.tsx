'use client';

import React from 'react';

interface ShieldLoaderProps {
  message?: string;
}

export function ShieldLoader({ message = 'Retrieving academic records…' }: ShieldLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Subtle pulsing outer ring */}
        <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-600 animate-spin" />
        {/* Centered Institutional Shield */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="SONUCH Institutional Shield"
            className="w-8 h-8 object-contain drop-shadow-sm"
          />
        </div>
      </div>
      <p className="text-xs font-bold text-slate-500 tracking-wide">{message}</p>
    </div>
  );
}
