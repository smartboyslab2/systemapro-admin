import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useBusinessStore } from '@/stores/businessStore';
import { usePaymentStore } from '@/stores/paymentStore';

const statusConfig = {
  active: { color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Activo' },
  trial: { color: '#DC2626', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'Prueba' },
  suspended: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Suspendido' },
  cancelled: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Cancelado' },
};

export default function RecentBusinesses() {
  const { businesses } = useBusinessStore();
  const { payments } = usePaymentStore();

  const recentBusinesses = [...businesses]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const getLastPayment = (businessId: string) => {
    const businessPayments = payments
      .filter(p => p.businessId === businessId && p.status === 'completed')
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
    return businessPayments[0];
  };

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Negocios Recientes</h3>
        <Link 
          to="/businesses" 
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
              <th className="text-left py-2 px-2 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Monto/Mes</th>
              <th className="text-left py-2 px-2 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Ultimo Pago</th>
            </tr>
          </thead>
          <tbody>
            {recentBusinesses.map((business) => {
              const config = statusConfig[business.status];
              const lastPayment = getLastPayment(business.id);
              return (
                <tr 
                  key={business.id} 
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => window.location.href = `/businesses/${business.id}`}
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'var(--bg-surface-hover)' }}
                      >
                        <img 
                          src={business.logoUrl || '/default-business-logo.png'} 
                          alt="" 
                          className="w-5 h-5 object-contain"
                          onError={e => { (e.target as HTMLImageElement).src = '/default-business-logo.png'; }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{business.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{business.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span 
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                      style={{ backgroundColor: config.bgColor, color: config.color }}
                    >
                      {config.label}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm hidden sm:table-cell" style={{ color: 'var(--text-primary)' }}>
                    RD${business.monthlyAmount.toLocaleString('es-DO')}
                  </td>
                  <td className="py-3 px-2 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                    {lastPayment 
                      ? new Date(lastPayment.paymentDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })
                      : 'N/A'
                    }
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
