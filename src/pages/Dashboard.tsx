import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, DollarSign, AlertTriangle, CreditCard,
  TrendingUp, ArrowRight
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { getClients } from '@/lib/mockApi';
import { getBusinesses } from '@/lib/mockApi';
import type { Client, Payment, Business } from '@/types';

const paymentStatusConfig = {
  completed: { color: 'var(--success)', bgColor: 'var(--success-bg)', label: 'Completado' },
  pending: { color: 'var(--warning)', bgColor: 'var(--warning-bg)', label: 'Pendiente' },
  failed: { color: 'var(--danger)', bgColor: 'var(--danger-bg)', label: 'Fallido' },
  refunded: { color: 'var(--text-muted)', bgColor: 'var(--bg-surface-hover)', label: 'Reembolsado' },
};

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [cList, bList] = await Promise.all([getClients(), getBusinesses()]);
      setClients(cList);
      setBusinesses(bList);

      // Load payments for all clients
      const { getPaymentsByClient } = await import('@/lib/mockApi');
      const allPayments: Payment[] = [];
      for (const client of cList) {
        const p = await getPaymentsByClient(client.id);
        allPayments.push(...p);
      }
      setClientPayments(allPayments);
      setIsLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const active = clients.filter(c => c.status === 'active');
    const overdue = clients.filter(c => c.status === 'overdue');
    const inactive = clients.filter(c => c.status === 'inactive');
    const totalMonthlyRent = active.reduce((s, c) => s + c.monthlyRent, 0);
    const totalPaid = clientPayments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
    const pendingPayments = clientPayments.filter(p => p.status === 'pending').length;

    return { activeCount: active.length, overdueCount: overdue.length, inactiveCount: inactive.length, totalMonthlyRent, totalPaid, pendingPayments };
  }, [clients, clientPayments]);

  const topClients = useMemo(() => {
    return [...clients]
      .filter(c => c.status === 'active')
      .sort((a, b) => b.monthlyRent - a.monthlyRent)
      .slice(0, 5);
  }, [clients]);

  const recentPayments = useMemo(() => {
    return [...clientPayments]
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);
  }, [clientPayments]);

  const getBusinessName = (id: string) => businesses.find(b => b.id === id)?.name || id;
  const getClientName = (id: string | null | undefined) => {
    if (!id) return '—';
    return clients.find(c => c.id === id)?.name || id;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', height: 120 }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="shimmer rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', height: 360 }} />
          <div className="shimmer rounded-xl" style={{ backgroundColor: 'var(--bg-surface)', height: 360 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ====== STAT CARDS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconColor="var(--success)"
          iconBgColor="var(--success-bg)"
          value={stats.activeCount}
          label="Clientes Activos"
          trend={`${stats.overdueCount} atrasados`}
          trendColor="var(--danger)"
          index={0}
        />
        <StatCard
          icon={DollarSign}
          iconColor="var(--accent-primary)"
          iconBgColor="rgba(220, 38, 38, 0.08)"
          value={`RD$${stats.totalMonthlyRent.toLocaleString('es-DO')}`}
          label="Ingreso Mensual por Rentas"
          trend={`${clients.length} clientes total`}
          trendColor="var(--accent-primary)"
          index={1}
        />
        <StatCard
          icon={AlertTriangle}
          iconColor="var(--danger)"
          iconBgColor="var(--danger-bg)"
          value={stats.overdueCount}
          label="Clientes Atrasados"
          trend="Requieren atencion"
          trendColor="var(--warning)"
          index={2}
        />
        <StatCard
          icon={CreditCard}
          iconColor="var(--text-secondary)"
          iconBgColor="rgba(59, 130, 246, 0.1)"
          value={stats.pendingPayments}
          label="Pagos Pendientes"
          trend={`RD$${stats.totalPaid.toLocaleString('es-DO')} cobrado`}
          trendColor="var(--success)"
          index={3}
        />
      </div>

      {/* ====== CHARTS ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Top Clientes</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Mayores rentas mensuales</p>
            </div>
            <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="space-y-3">
            {topClients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ backgroundColor: i < 3 ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface-hover)', color: i < 3 ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{client.name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{getBusinessName(client.businessId)}</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>RD${client.monthlyRent.toLocaleString('es-DO')}</p>
              </motion.div>
            ))}
          </div>
          <Link to="/clients" className="flex items-center justify-center gap-1 mt-4 pt-3 text-xs font-medium transition-colors" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--accent-primary)' }}>
            Ver todos los clientes <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ====== RECENT PAYMENTS ====== */}
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Pagos Recientes de Clientes</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ultimos pagos registrados</p>
          </div>
          <Link to="/payments" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Cliente</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Sistema</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Monto</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Metodo</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Fecha</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((payment, index) => {
                const cfg = paymentStatusConfig[payment.status];
                return (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="py-2.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {getClientName(payment.clientId)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)' }}>
                        {getBusinessName(payment.businessId)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      RD${payment.amount.toLocaleString('es-DO')}
                    </td>
                    <td className="py-2.5 px-4 text-sm capitalize hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {payment.paymentMethod}
                    </td>
                    <td className="py-2.5 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(payment.paymentDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                        {payment.status === 'completed' ? '✓' : payment.status === 'pending' ? '◷' : '✕'} {cfg.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
