import { Users, BarChart2, GraduationCap, Bell, CalendarDays, Sliders, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export function AdminHub() {
  const { activeSystemSession, academicPolicy, students, results } = useAppStore();

  const publishedResults = results.filter((r) => r.isPublished);
  const totalStudents = students.length;

  return (
    <div className="flex-1 px-4 py-6 space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Welcome Hero */}
      <div className="glass-card p-5 relative overflow-hidden border-amber-500/20">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0 shadow-lg badge-fill">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <p className="text-uch-muted text-xs font-medium">Welcome back,</p>
            <h2 className="font-bold text-lg" style={{ color: 'var(--uch-fg)' }}>School Administrator</h2>
            <p className="text-uch-muted text-xs mt-0.5">
              UCH School of Nursing · Result Management System
            </p>
          </div>
        </div>
      </div>

      {/* Quick Summary Metrics */}
      <h3 className="text-xs font-bold text-uch-muted uppercase tracking-widest px-1">
        Institutional Overview
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Students',
            value: totalStudents,
            icon: Users,
            color: 'text-teal-600 dark:text-teal-400',
            bg: 'bg-teal-500/10 border-teal-500/20',
          },
          {
            label: 'Published Results',
            value: publishedResults.length,
            icon: BarChart2,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'System Session',
            value: activeSystemSession,
            icon: CalendarDays,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
          {
            label: 'Policy Ratio',
            value: academicPolicy.isConfigured ? `${academicPolicy.maxCA}/${academicPolicy.maxExam}` : 'Setup Needed',
            icon: Sliders,
            color: academicPolicy.isConfigured ? 'text-sky-600 dark:text-sky-400' : 'text-orange-400',
            bg: 'bg-sky-500/10 border-sky-500/20',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card p-4 bg-emerald-50/70 dark:bg-uch-card border border-emerald-200/60 dark:border-uch-border shadow-md">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold text-slate-700 dark:text-uch-muted uppercase tracking-wide">{label}</p>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-xl md:text-2xl font-bold leading-none ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* System Status & Activity Feed */}
      <div className="glass-card p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-700 dark:text-uch-muted uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={16} className="text-orange-500" />
          System Status &amp; Activity Log
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-uch-surface border border-slate-200 dark:border-uch-border shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center flex-shrink-0">
              <Bell size={15} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Latest Published Result</p>
              <p className="text-slate-600 dark:text-uch-muted text-[11px] mt-0.5">
                {publishedResults.length > 0
                  ? `${publishedResults[publishedResults.length - 1]?.academicSession} · ${publishedResults[publishedResults.length - 1]?.level} Semester ${publishedResults[publishedResults.length - 1]?.semester}`
                  : 'No published results yet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-uch-surface border border-slate-200 dark:border-uch-border shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sliders size={15} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Academic Policy Configuration</p>
              <p className="text-slate-600 dark:text-uch-muted text-[11px] mt-0.5">
                {academicPolicy.isConfigured
                  ? `Active Ratio: ${academicPolicy.maxCA}% CA / ${academicPolicy.maxExam}% Exam · ${academicPolicy.gradeBoundaries.length} Grade Boundaries`
                  : 'Pending setup — Click Menu ➔ Academic Policy & Grading to configure.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
