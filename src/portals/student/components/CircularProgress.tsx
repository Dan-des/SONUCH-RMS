// Circular progress ring component
interface CircularProgressProps {
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function CircularProgress({
  completed,
  total,
  size = 120,
  strokeWidth = 10,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const getGradientColor = () => {
    if (progress >= 0.8) return '#10b981';
    if (progress >= 0.5) return '#0d9488';
    if (progress >= 0.3) return '#f59e0b';
    return '#7f9e95';
  };

  const gradId = `progress-grad-${size}`;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getGradientColor()} stopOpacity="1" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="circle-track"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="circle-progress"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none" style={{ color: 'var(--uch-fg)' }}>
          {completed}
        </span>
        <span className="text-xs text-uch-muted mt-0.5">of {total}</span>
      </div>
    </div>
  );
}
