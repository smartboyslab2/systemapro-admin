import { NavLink, useLocation } from 'react-router-dom';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clients', label: 'Clientes', icon: Users },
  { path: '/businesses', label: 'Negocios', icon: Building2 },
  { path: '/payments', label: 'Pagos', icon: CreditCard },
  { path: '/documents', label: 'Documentos', icon: FileText },
  { path: '/settings', label: 'Configuracion', icon: Settings },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarHovered, setSidebarHovered } = useUIStore();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  // ======== MOBILE ========
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <Menu size={20} style={{ color: 'var(--text-primary)' }} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-sm"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: -300, opacity: 0.8 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0.8 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden flex flex-col"
                style={{
                  background: 'linear-gradient(180deg, rgba(248,248,249,0.98) 0%, rgba(255,255,255,0.99) 100%)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                  borderRight: '1px solid rgba(30,41,59,0.5)',
                }}
              >
                {/* Glow accent at top */}
                <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-30"
                  style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />

                <div className="flex items-center justify-between px-5 h-16 flex-shrink-0 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}>
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>SystemaPro</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    <X size={18} />
                  </button>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 relative z-10">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <NavLink key={item.path} to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative"
                        style={{
                          backgroundColor: isActive ? 'rgba(220, 38, 38, 0.10)' : 'transparent',
                          color: isActive ? '#EF4444' : 'var(--text-secondary)',
                        }}>
                        {isActive && (
                          <motion.div layoutId="mob-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#DC2626]" />
                        )}
                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="px-4 py-3 flex-shrink-0 relative z-10"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden" style={{ border: '2px solid var(--border-medium)' }}>
                      <img src={user?.avatar || '/avatar-admin.jpg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Super Admin</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ======== DESKTOP: Modern auto-hide sidebar ========
  return (
    <>
      {/* Invisible hover trigger zone on left edge */}
      <div
        className="fixed left-0 top-0 bottom-0 w-3 z-40 hidden lg:block"
        onMouseEnter={() => setSidebarHovered(true)}
        style={{ background: 'transparent' }}
      />

      <aside
        ref={sidebarRef}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col transition-all duration-300 ease-out"
        style={{
          width: (!sidebarCollapsed || sidebarHovered) ? 240 : 68,
          background: sidebarHovered
            ? 'linear-gradient(180deg, rgba(248,248,249,0.98) 0%, rgba(255,255,255,0.99) 100%)'
            : 'linear-gradient(180deg, rgba(248,248,249,0.94) 0%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(40px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
          borderRight: '1px solid rgba(30,41,59,0.4)',
          boxShadow: sidebarHovered ? '4px 0 30px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Top ambient glow */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(ellipse 70% 40% at 30% 0%, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center h-16 px-4 flex-shrink-0 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}>
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <AnimatePresence>
            {(!sidebarCollapsed || sidebarHovered) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-base ml-3 whitespace-nowrap overflow-hidden"
                style={{ color: 'var(--text-primary)' }}
              >
                SystemaPro
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Pin toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute top-5 -right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all z-50 opacity-0 hover:opacity-100"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            opacity: sidebarHovered ? 1 : 0,
          }}
        >
          <ChevronLeft size={12}
            className="transition-transform duration-300"
            style={{
              color: 'var(--text-muted)',
              transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto relative z-10">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group"
                style={{
                  backgroundColor: isActive ? 'rgba(220, 38, 38, 0.10)' : 'transparent',
                  color: isActive ? '#EF4444' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.04)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-dot"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-[#DC2626]"
                    style={{ height: 20 }}
                  />
                )}
                <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? 'text-[#EF4444]' : ''}`}>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <AnimatePresence>
                  {(!sidebarCollapsed || sidebarHovered) && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="font-medium text-[13px] whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 flex-shrink-0 relative z-10"
          style={{ borderTop: '1px solid rgba(30,41,59,0.3)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0" style={{ border: '2px solid var(--border-medium)' }}>
              <img src={user?.avatar || '/avatar-admin.jpg'} alt="" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence>
              {(!sidebarCollapsed || sidebarHovered) && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="flex-1 min-w-0 overflow-hidden"
                >
                  <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Super Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {(!sidebarCollapsed || sidebarHovered) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <LogOut size={15} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>
    </>
  );
}
