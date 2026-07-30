import { TrendingUp, Star, BookOpen, Bell } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { MetricCard } from '../components/MetricCard';
import { CircularProgress } from '../components/CircularProgress';
import { computeCGPA } from '../../../data/mockResults';

export function HomeTab() {
  const { currentStudentId, students, results, setStudentActiveTab } = useAppStore();
  const student = students.find((s) => s.id === currentStudentId);
  const studentResults = results.filter((r) => r.studentId === currentStudentId);

  if (!student) return null;

  const cgpa = computeCGPA(studentResults);
  const publishedResults = studentResults.filter((r) => r.isPublished);
  const latestResult = publishedResults.sort((a, b) => {
    const levels = ['100L', '200L', '300L', '400L', '500L'];
    const la = levels.indexOf(a.level);
    const lb = levels.indexOf(b.level);
    if (la !== lb) return lb - la;
    return b.semester - a.semester;
  })[0];

  const sgpa = latestResult?.sgpa ?? 0;
  const completedSemesters = publishedResults.length;
  const totalSemesters = 10;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const cgpaClass =
    cgpa >= 4.5
      ? 'text-emerald-600 dark:text-emerald-400'
      : cgpa >= 3.5
      ? 'text-sky-600 dark:text-sky-400'
      : cgpa >= 2.5
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  const sgpaClass =
    sgpa >= 4.5
      ? 'text-emerald-600 dark:text-emerald-400'
      : sgpa >= 3.5
      ? 'text-sky-600 dark:text-sky-400'
      : sgpa >= 2.5
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <div className="page-container px-4 pt-5 space-y-5">
      {/* Greeting Hero */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -translate-y-8 translate-x-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-amber-500/10 rounded-full translate-y-6 -translate-x-6 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.fullName}
                className="w-12 h-12 rounded-full object-cover shadow-lg flex-shrink-0 border-2 border-teal-500/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-accent-gradient flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 badge-fill">
                {student.avatarInitials}
              </div>
            )}
            <div>
              <p className="text-uch-muted text-xs font-medium">
                {greeting},
              </p>
              <h2 className="font-bold text-lg leading-tight" style={{ color: 'var(--uch-fg)' }}>
                {student.surname || student.lastName || student.fullName.split(' ')[0]}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-semibold">
              {student.level}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-uch-surface border border-uch-border text-uch-muted text-xs font-medium">
              {student.matricNo}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-uch-surface border border-uch-border text-uch-muted text-xs font-medium">
              {student.department}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <h3 className="text-xs font-bold text-uch-muted uppercase tracking-widest px-1">
        Academic Overview
      </h3>

      {/* CGPA + SGPA row */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Cumulative GPA"
          value={cgpa.toFixed(2)}
          subtitle="out of 5.00"
          icon={<TrendingUp size={16} />}
          accentClass={cgpaClass}
        />
        <MetricCard
          label="Latest SGPA"
          value={sgpa.toFixed(2)}
          subtitle={latestResult ? `${latestResult.level} · Sem ${latestResult.semester}` : 'No data'}
          icon={<Star size={16} />}
          accentClass={sgpaClass}
        />
      </div>

      {/* Semester Progress */}
      <div className="glass-card p-5">
        <p className="text-xs font-semibold text-uch-muted uppercase tracking-wider mb-4">
          Programme Progress
        </p>
        <div className="flex items-center gap-6">
          <CircularProgress completed={completedSemesters} total={totalSemesters} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-uch-muted mb-1">
                <span>Semesters Completed</span>
                <span className="font-bold" style={{ color: 'var(--uch-fg)' }}>
                  {completedSemesters}/{totalSemesters}
                </span>
              </div>
              <div className="h-1.5 bg-uch-surface border border-uch-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-gradient rounded-full transition-all duration-1000"
                  style={{ width: `${(completedSemesters / totalSemesters) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-uch-muted leading-relaxed">
              {completedSemesters < totalSemesters
                ? `${totalSemesters - completedSemesters} semester${
                    totalSemesters - completedSemesters !== 1 ? 's' : ''
                  } remaining to complete the B.Sc. Nursing programme.`
                : 'Programme complete! Congratulations!'}
            </p>
          </div>
        </div>
      </div>

      {/* Latest Result Release Banner */}
      {latestResult && (
        <div className="glass-card p-5 border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-transparent animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0 border border-teal-500/20">
              <Bell size={18} className="text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                Latest Result Release
              </p>
              <p className="font-semibold mt-1" style={{ color: 'var(--uch-fg)' }}>
                {latestResult.level} — Semester {latestResult.semester} Results Available
              </p>
              <p className="text-xs text-uch-muted mt-0.5">
                Published •{' '}
                {latestResult.publishedAt
                  ? new Date(latestResult.publishedAt).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Recently'}{' '}
                · SGPA:{' '}
                <span className={`font-bold ${sgpaClass}`}>{latestResult.sgpa.toFixed(2)}</span>
              </p>
              <button
                id="view-latest-result-btn"
                onClick={() => setStudentActiveTab('results')}
                className="mt-3 flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-sm font-semibold hover:gap-2.5 transition-all duration-200"
              >
                <BookOpen size={14} />
                View Full Results
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
