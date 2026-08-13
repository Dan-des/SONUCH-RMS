'use client';

import React, { useState, useEffect } from 'react';

interface ResultCountdownProps {
  targetDate: string | Date;
  level: string;
  onTimeExpired?: () => void;
}

export function ResultCountdown({ targetDate, level, onTimeExpired }: ResultCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onTimeExpired) onTimeExpired();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onTimeExpired]);

  if (isExpired) {
    return (
      <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl text-center space-y-1">
        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
          🎉 {level} Results Are Now Unlocked & Released!
        </span>
        <p className="text-xs text-emerald-700 font-medium">
          The countdown target date has passed. Refreshing page to access grade transcript…
        </p>
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="w-full bg-gradient-to-r from-emerald-900 to-teal-800 text-white p-6 rounded-3xl shadow-xl space-y-4 text-center">
      <div className="space-y-1">
        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
          Official Release Countdown
        </span>
        <h2 className="text-lg font-black text-white">{level} Academic Results Release Timer</h2>
        <p className="text-xs text-emerald-200">
          Results for your level will automatically unlock when the countdown reaches zero.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        <div className="bg-emerald-950/60 border border-emerald-700/50 p-2.5 rounded-2xl">
          <div className="text-2xl font-black text-emerald-300 font-mono">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-[9px] font-bold uppercase text-slate-300">Days</div>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-700/50 p-2.5 rounded-2xl">
          <div className="text-2xl font-black text-emerald-300 font-mono">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-[9px] font-bold uppercase text-slate-300">Hours</div>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-700/50 p-2.5 rounded-2xl">
          <div className="text-2xl font-black text-emerald-300 font-mono">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-[9px] font-bold uppercase text-slate-300">Mins</div>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-700/50 p-2.5 rounded-2xl">
          <div className="text-2xl font-black text-emerald-300 font-mono">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-[9px] font-bold uppercase text-slate-300">Secs</div>
        </div>
      </div>
    </div>
  );
}
