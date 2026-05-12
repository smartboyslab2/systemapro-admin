import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Resumen de clientes y pagos' },
  '/clients': { title: 'Clientes', subtitle: 'Negocios que rentan tus sistemas' },
  '/businesses': { title: 'Negocios', subtitle: 'Tus sistemas y marcas' },
  '/payments': { title: 'Pagos', subtitle: 'Historial de pagos de clientes' },
  '/documents': { title: 'Documentos', subtitle: 'Archivos y contratos' },
  '/settings': { title: 'Configuracion', subtitle: 'Ajustes del sistema' },
};

export default function TopBar() {
  const location = useLocation();
  const { unreadCount, notifications, markNotificationRead, markAllRead, generateNotifications } = useUIStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    generateNotifications();
  }, [generateNotifications]);

  const pageInfo = pageTitles[location.pathname] || { title: 'SystemaPro', subtitle: '' };

  return (
    <header
      className="fixed top-0 right-0 left-0 h-16 flex items-center justify-between px-4 sm:px-6 z-40"
      style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2 ml-12 lg:ml-20">
        <div>
          <h1 className="text-lg font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {pageInfo.title}
          </h1>
          <p className="text-[11px] leading-tight hidden sm:block" style={{ color: 'var(--text-muted)' }}>
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all relative"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Bell size={18} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                  style={{ backgroundColor: 'var(--danger)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-[360px] rounded-xl shadow-2xl z-50 overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notificaciones</h3>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Actividad reciente de clientes</p>
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors" style={{ color: 'var(--accent-primary)' }}>
                        <CheckCheck size={12} /> Marcar leidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4">
                        <Bell size={28} style={{ color: 'var(--text-muted)' }} />
                        <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Sin notificaciones</p>
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          onClick={() => markNotificationRead(notif.id)}
                          className="px-4 py-3 cursor-pointer transition-colors relative"
                          style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: notif.read ? 'transparent' : 'rgba(220, 38, 38, 0.04)' }}
                        >
                          {!notif.read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }} />}
                          <div className="flex items-start gap-2 pl-2">
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ backgroundColor: notif.type === 'payment' ? 'var(--success)' : notif.type === 'alert' ? 'var(--warning)' : 'var(--text-secondary)', opacity: notif.read ? 0.3 : 1 }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
                              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notif.message}</p>
                              <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                                {new Date(notif.createdAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--border-medium)' }}>
          <img src={user?.avatar || '/avatar-admin.jpg'} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
