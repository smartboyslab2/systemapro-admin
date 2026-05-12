import { create } from 'zustand';
import type { Toast } from '@/types';

interface UIState {
  sidebarCollapsed: boolean;
  sidebarHovered: boolean;
  toasts: Toast[];
  activeModal: string | null;
  notifications: { id: string; title: string; message: string; read: boolean; createdAt: string; type: 'payment' | 'alert' | 'info' }[];
  unreadCount: number;
  toggleSidebar: () => void;
  setSidebarHovered: (v: boolean) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setActiveModal: (modal: string | null) => void;
  generateNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarHovered: false,
  toasts: [],
  activeModal: null,
  notifications: [],
  unreadCount: 0,

  toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarHovered: (v) => set({ sidebarHovered: v }),

  showToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    set(state => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  setActiveModal: (modal) => set({ activeModal: modal }),

  generateNotifications: async () => {
    const { mockClients } = await import('@/lib/mockData');
    const now = Date.now();
    const notifs: UIState['notifications'] = [];

    const overdueClients = mockClients.filter(c => {
      if (!c.lastPaymentDate) return false;
      const daysSince = (now - new Date(c.lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24);
      return c.status === 'overdue' || daysSince > 30;
    });
    overdueClients.forEach(c => {
      notifs.push({
        id: 'ovd-' + c.id,
        title: `Pago atrasado: ${c.name}`,
        message: `Cliente con renta de RD$${c.monthlyRent.toLocaleString('es-DO')}/mes. Ultimo pago: ${c.lastPaymentDate ? new Date(c.lastPaymentDate).toLocaleDateString('es-DO') : 'N/A'}`,
        read: false,
        createdAt: c.lastPaymentDate || new Date().toISOString(),
        type: 'alert',
      });
    });

    const recentClients = mockClients.filter(c => {
      const days = (now - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 7 && c.status === 'active';
    });
    recentClients.forEach(c => {
      notifs.push({
        id: 'new-' + c.id,
        title: `Nuevo cliente: ${c.name}`,
        message: `Registrado con ${c.licenseCount} licencia(s). Renta: RD$${c.monthlyRent.toLocaleString('es-DO')}/mes`,
        read: false,
        createdAt: c.createdAt,
        type: 'info',
      });
    });

    const premiumClients = mockClients.filter(c => c.monthlyRent >= 5000 && c.status === 'active');
    premiumClients.forEach(c => {
      notifs.push({
        id: 'prm-' + c.id,
        title: `Cliente Premium: ${c.name}`,
        message: `Generando RD$${c.monthlyRent.toLocaleString('es-DO')}/mes con ${c.licenseCount} licencias`,
        read: false,
        createdAt: new Date().toISOString(),
        type: 'payment',
      });
    });

    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const final = notifs.slice(0, 15);

    set({ notifications: final, unreadCount: final.filter(n => !n.read).length });
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: () => {
    set(state => ({ notifications: state.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 }));
  },
}));
