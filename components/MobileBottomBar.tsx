'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  Award,
  FileText,
  User,
} from 'lucide-react';

export function MobileBottomBar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/student/dashboard', label: 'Home', icon: Home },
    { href: '/student/courses', label: 'Courses', icon: BookOpen },
    { href: '/student/results', label: 'Results', icon: Award },
    { href: '/student/policies', label: 'Policies', icon: FileText },
    { href: '/student/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-teal-800 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-teal-50 text-teal-800 shadow-xs' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default MobileBottomBar;
