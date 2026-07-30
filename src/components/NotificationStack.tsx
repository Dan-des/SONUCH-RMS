import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/40 bg-red-500/10 text-red-400',
  info: 'border-uch-accent/40 bg-uch-accent/10 text-uch-accent',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
};

export function NotificationStack() {
  const { notifications, removeNotification } = useAppStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        const Icon = iconMap[n.type];
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg animate-slide-down pointer-events-auto ${colorMap[n.type]}`}
          >
            <Icon size={16} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1 leading-snug">{n.message}</p>
            <button
              onClick={() => removeNotification(n.id)}
              className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
