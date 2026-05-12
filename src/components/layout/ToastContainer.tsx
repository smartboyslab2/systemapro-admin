import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22C55E', icon: '#22C55E' },
  error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', icon: '#EF4444' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', icon: '#F59E0B' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#DC2626', icon: '#DC2626' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          const color = colors[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg overflow-hidden shadow-lg"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: `1px solid var(--border-subtle)`,
                borderLeft: `3px solid ${color.border}`,
              }}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                <Icon size={18} style={{ color: color.icon }} className="flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {toast.title}
                  </p>
                  {toast.description && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <X size={14} />
                </button>
              </div>
              {/* Progress bar */}
              <div 
                className="h-0.5 toast-progress"
                style={{ backgroundColor: color.border }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
