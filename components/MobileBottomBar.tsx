'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileBottomBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/student/dashboard', label: 'Home' },
    { href: '/student/courses', label: 'Courses' },
    { href: '/student/results', label: 'Results' },
    { href: '/student/policies', label: 'Policies' },
    { href: '/student/profile', label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-2 no-print">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded text-[11px] font-bold transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MobileBottomBar;
