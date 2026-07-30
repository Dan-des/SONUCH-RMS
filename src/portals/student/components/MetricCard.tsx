import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  accentClass?: string;
  children?: ReactNode;
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon,
  accentClass = 'text-uch-accent',
  children,
}: MetricCardProps) {
  return (
    <div className="metric-card hover:border-uch-border transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-uch-muted uppercase tracking-wider">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-uch-muted group-hover:text-uch-accent transition-colors">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2">
        {children ? (
          children
        ) : (
          <>
            <p className={`text-3xl font-bold leading-none ${accentClass}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-uch-muted mt-1">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
