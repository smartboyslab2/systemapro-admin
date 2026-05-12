import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { usePaymentStore } from '@/stores/paymentStore';
import { useBusinessStore } from '@/stores/businessStore';
import type { Payment } from '@/types';

const statusConfig = {
  completed: { icon: CheckCircle, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Completado' },
  pending: { icon: Clock, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Pendiente' },
  failed: { icon: XCircle, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Fallido' },
  refunded: { icon: XCircle, color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.1)', label: 'Reembolsado' },
};

export default function RecentPayments() {
  const { payments, fetchPayments } = usePaymentStore();
  const { businesses } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments().then(() => setIsLoading(false));
  }, [fetchPayments]);

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getBusinessName = (businessId: string) => {
    return businesses.find(b => b.id === businessId)?.name || 'Desconocido';
  };

  if (isLoading) {
    return (
      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="shimmer rounded-lg h-[250px]" />
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pagos Recientes</h3>
        <Link 
          to="/payments" 
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: 'var(--accent-primary)' }}
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Negocio</th>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Monto</th>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Metodo</th>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Fecha</th>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {recentPayments.map((payment: Payment) => {
              const config = statusConfig[payment.status];
              const StatusIcon = config.icon;
              return (
                <tr 
                  key={payment.id} 
                  className="transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td className="py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {getBusinessName(payment.businessId)}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    RD${payment.amount.toLocaleString('es-DO')}
                  </td>
                  <td className="py-3 px-2 text-sm capitalize hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {payment.paymentMethod}
                  </td>
                  <td className="py-3 px-2 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(payment.paymentDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 px-2">
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      <StatusIcon size={12} />
                      <span className="hidden sm:inline">{config.label}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
