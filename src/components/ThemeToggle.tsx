import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const OPTIONS = [
  { value: 'light' as const,  label: 'Light',  icon: Sun },
  { value: 'dark'  as const,  label: 'Dark',   icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
];

/**
 * Compact 3-way theme toggle for placement in nav headers.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useAppStore();

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[1];
  const Icon = current.icon;

  // Cycle to next theme on click
  const cycleTheme = () => {
    const idx = OPTIONS.findIndex((o) => o.value === theme);
    const next = OPTIONS[(idx + 1) % OPTIONS.length];
    setTheme(next.value);
  };

  return (
    <button
      id="theme-toggle-btn"
      onClick={cycleTheme}
      title={`Theme: ${current.label} (click to switch)`}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-95"
      style={{
        background: 'var(--uch-card)',
        border: '1px solid var(--uch-border)',
        color: 'var(--uch-muted)',
      }}
    >
      <Icon size={14} className="text-teal-600 dark:text-teal-400" />
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}

/**
 * Full theme selector with labeled buttons for settings panels.
 */
export function ThemeSelector() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: 'var(--uch-surface)', border: '1px solid var(--uch-border)' }}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            id={`theme-${value}`}
            onClick={() => setTheme(value)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: isActive ? 'var(--uch-primary)' : 'transparent',
              color: isActive ? 'white' : 'var(--uch-muted)',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
