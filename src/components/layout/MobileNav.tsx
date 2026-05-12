import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, CreditCard, FileText } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Inicio', icon: LayoutDashboard },
  { path: '/clients', label: 'Clientes', icon: Users },
  { path: '/businesses', label: 'Negocios', icon: Building2 },
  { path: '/payments', label: 'Pagos', icon: CreditCard },
  { path: '/documents', label: 'Docs', icon: FileText },
];

export default function MobileNav() {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe"
      style={{ 
        backgroundColor: 'rgba(13, 17, 26, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive ? '' : ''
              }`
            }
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
