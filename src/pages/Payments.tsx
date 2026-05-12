import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import { useBusinessStore } from '@/stores/businessStore';
import { useUIStore } from '@/stores/uiStore';
import { createPayment } from '@/lib/mockApi';
import type { Payment, PaymentMethod } from '@/types';

const statusConfig = {
  completed: { icon: CheckCircle, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Completado' },
  pending: { icon: Clock, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Pendiente' },
  failed: { icon: XCircle, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Fallido' },
  refunded: { icon: XCircle, color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.1)', label: 'Reembolsado' },
};

const methodIcons: Record<string, typeof CreditCard> = {
  stripe: CreditCard,
  paypal: CreditCard,
  cash: DollarSign,
  transfer: TrendingUp,
};

export default function Payments() {
  const { payments, filters, setFilters, fetchPayments } = usePaymentStore();
  const { businesses } = useBusinessStore();
  const [search, setSearch] = useState(filters.search);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments().then(() => setIsLoading(false));
  }, [fetchPayments]);

  useEffect(() => {
    const timer = setTimeout(() => setFilters({ search }), 300);
    return () => clearTimeout(timer);
  }, [search, setFilters]);

  const filteredPayments = payments.filter(p => {
    const matchesStatus = filters.status === 'all' || p.status === filters.status;
    const matchesMethod = filters.method === 'all' || p.paymentMethod === filters.method;
    const searchLower = filters.search.toLowerCase();
    const businessName = businesses.find(b => b.id === p.businessId)?.name?.toLowerCase() || '';
    const matchesSearch = !filters.search || businessName.includes(searchLower);
    return matchesStatus && matchesMethod && matchesSearch;
  });

  const stats = {
    totalThisMonth: payments
      .filter(p => p.status === 'completed' && new Date(p.paymentDate).getMonth() === 4 && new Date(p.paymentDate).getFullYear() === 2025)
      .reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    totalPayments: payments.filter(p => p.status === 'completed' && new Date(p.paymentDate).getMonth() === 4).length,
    failedCount: payments.filter(p => p.status === 'failed').length,
  };

  const getBusinessName = (id: string) => businesses.find(b => b.id === id)?.name || 'Desconocido';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer rounded-xl h-24" style={{ backgroundColor: 'var(--bg-surface)' }} />
          ))}
        </div>
        <div className="shimmer rounded-xl h-96" style={{ backgroundColor: 'var(--bg-surface)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, iconColor: '#DC2626', iconBg: 'rgba(220, 38, 38, 0.08)', label: 'Cobrado Este Mes', value: `RD$${stats.totalThisMonth.toLocaleString('es-DO')}` },
          { icon: AlertTriangle, iconColor: '#F59E0B', iconBg: 'rgba(245, 158, 11, 0.1)', label: 'Total Pendiente', value: `RD$${stats.pendingAmount.toLocaleString('es-DO')}` },
          { icon: CreditCard, iconColor: '#22C55E', iconBg: 'rgba(34, 197, 94, 0.1)', label: 'Pagos Este Mes', value: stats.totalPayments },
          { icon: XCircle, iconColor: '#EF4444', iconBg: 'rgba(239, 68, 68, 0.1)', label: 'Pagos Fallidos', value: stats.failedCount },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.iconBg }}>
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {(['all', 'completed', 'pending', 'failed', 'refunded'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilters({ status: s })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: filters.status === s ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: filters.status === s ? '#fff' : 'var(--text-secondary)',
                border: filters.status === s ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {s === 'all' ? 'Todos' : statusConfig[s].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar negocio..."
              className="w-full sm:w-56 h-10 rounded-lg pl-9 pr-4 text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
          <select
            value={filters.method}
            onChange={e => setFilters({ method: e.target.value as PaymentMethod | 'all' })}
            className="h-10 rounded-lg px-3 text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="all">Todos los metodos</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="cash">Efectivo</option>
            <option value="transfer">Transferencia</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-lg text-sm font-semibold text-white flex items-center gap-2 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Negocio</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Monto</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Metodo</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Periodo</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Fecha</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment: Payment, index: number) => {
                const config = statusConfig[payment.status];
                const StatusIcon = config.icon;
                const MethodIcon = methodIcons[payment.paymentMethod] || CreditCard;
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    className="transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {getBusinessName(payment.businessId)}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      RD${payment.amount.toLocaleString('es-DO')}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                        <MethodIcon size={14} /> {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(payment.periodStart).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })} - {new Date(payment.periodEnd).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(payment.paymentDate).toLocaleDateString('es-DO')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: config.bgColor, color: config.color }}>
                        <StatusIcon size={12} /> {config.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <CreditCard size={48} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Sin pagos encontrados</p>
          </div>
        )}
      </div>

      {showAddModal && <AddPaymentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddPaymentModal({ onClose }: { onClose: () => void }) {
  const { businesses, fetchBusinesses } = useBusinessStore();
  const { fetchPayments } = usePaymentStore();
  const { showToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    businessId: '',
    amount: '',
    paymentMethod: 'cash' as PaymentMethod,
    paymentDate: new Date().toISOString().split('T')[0],
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessId || !form.amount) return;
    setIsSubmitting(true);
    try {
      await createPayment({
        businessId: form.businessId,
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod,
        status: 'completed',
        paymentDate: new Date(form.paymentDate).toISOString(),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        notes: form.notes,
        stripePaymentIntentId: null,
        paypalOrderId: null,
        receiptUrl: null,
      });
      showToast({ type: 'success', title: 'Pago registrado', description: 'El pago se registro correctamente' });
      fetchPayments();
      onClose();
    } catch {
      showToast({ type: 'error', title: 'Error', description: 'No se pudo registrar el pago' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
      >
        <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Registrar Pago</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Negocio *</label>
            <select
              value={form.businessId}
              onChange={e => setForm(p => ({ ...p, businessId: e.target.value }))}
              required
              className="w-full h-10 rounded-lg px-3 text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              <option value="">Seleccionar negocio</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Monto (RD$) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Metodo *</label>
              <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value as PaymentMethod }))} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha de Pago</label>
            <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Periodo Inicio</label>
              <input type="date" value={form.periodStart} onChange={e => setForm(p => ({ ...p, periodStart: e.target.value }))} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Periodo Fin</label>
              <input type="date" value={form.periodEnd} onChange={e => setForm(p => ({ ...p, periodEnd: e.target.value }))} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-sm" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
