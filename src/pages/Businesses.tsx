import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, MoreVertical, Eye, Edit, CreditCard, Pause, X, LayoutGrid, Table2 } from 'lucide-react';
import { useBusinessStore } from '@/stores/businessStore';
import { useUIStore } from '@/stores/uiStore';
import type { Business, BusinessStatus, ViewMode } from '@/types';

const statusTabs: { value: BusinessStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'trial', label: 'Prueba' },
  { value: 'suspended', label: 'Suspendidos' },
  { value: 'cancelled', label: 'Cancelados' },
];

const statusConfig = {
  active: { color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Activo' },
  trial: { color: '#DC2626', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'Prueba' },
  suspended: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Suspendido' },
  cancelled: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Cancelado' },
};

export default function Businesses() {
  const { businesses, filters, setFilters, fetchBusinesses, isLoading } = useBusinessStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState(filters.search);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setFilters]);

  const filteredBusinesses = businesses.filter(b => {
    const matchesStatus = filters.status === 'all' || b.status === filters.status;
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = !filters.search || 
      b.name.toLowerCase().includes(searchLower) ||
      b.domain.toLowerCase().includes(searchLower) ||
      b.email.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (status: BusinessStatus | 'all') => {
    setFilters({ status });
  };

  const handleSuspend = (business: Business) => {
    const newStatus = business.status === 'suspended' ? 'active' : 'suspended';
    useBusinessStore.getState().updateBusiness(business.id, { status: newStatus });
    showToast({ 
      type: 'success', 
      title: 'Estado actualizado', 
      description: `${business.name} ahora esta ${newStatus === 'active' ? 'activo' : 'suspendido'}` 
    });
    setActionMenuId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="shimmer rounded-xl h-16" style={{ backgroundColor: 'var(--bg-surface)' }} />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shimmer rounded-xl h-16" style={{ backgroundColor: 'var(--bg-surface)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
          {statusTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: filters.status === tab.value ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: filters.status === tab.value ? '#fff' : 'var(--text-secondary)',
                border: filters.status === tab.value ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o dominio..."
              className="w-full sm:w-64 h-10 rounded-lg pl-9 pr-4 text-sm outline-none transition-all"
              style={{ 
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('table')}
              className="p-2 transition-colors"
              style={{ 
                backgroundColor: viewMode === 'table' ? 'var(--bg-surface-hover)' : 'transparent',
                color: viewMode === 'table' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              <Table2 size={16} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className="p-2 transition-colors"
              style={{ 
                backgroundColor: viewMode === 'card' ? 'var(--bg-surface-hover)' : 'transparent',
                color: viewMode === 'card' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 rounded-lg text-sm font-semibold text-white flex items-center gap-2 flex-shrink-0 transition-all"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Negocio</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        /* Table View */
        <div 
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Negocio</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Contacto</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Monto/Mes</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Ultimo Pago</th>
                  <th className="py-3 px-4 w-10" />
                </tr>
              </thead>
              <tbody>
                {filteredBusinesses.map((business, index) => {
                  const config = statusConfig[business.status];
                  return (
                    <motion.tr
                      key={business.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="cursor-pointer transition-colors group"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      onClick={() => navigate(`/businesses/${business.id}`)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
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
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{business.email}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{business.phone}</p>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          RD${business.monthlyAmount.toLocaleString('es-DO')}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                          style={{ backgroundColor: config.bgColor, color: config.color }}
                        >
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(business.updatedAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setActionMenuId(actionMenuId === business.id ? null : business.id)}
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {actionMenuId === business.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActionMenuId(null)} />
                              <div 
                                className="absolute right-0 top-8 w-48 rounded-lg shadow-lg z-50 py-1"
                                style={{ 
                                  backgroundColor: 'var(--bg-surface)', 
                                  border: '1px solid var(--border-subtle)',
                                  boxShadow: 'var(--shadow-lg)',
                                }}
                              >
                                <button
                                  onClick={() => { navigate(`/businesses/${business.id}`); setActionMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                  style={{ color: 'var(--text-primary)' }}
                                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <Eye size={14} /> Ver detalle
                                </button>
                                <button
                                  onClick={() => { setActionMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                  style={{ color: 'var(--text-primary)' }}
                                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <Edit size={14} /> Editar
                                </button>
                                <button
                                  onClick={() => { navigate(`/payments?business=${business.id}`); setActionMenuId(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                  style={{ color: 'var(--text-primary)' }}
                                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <CreditCard size={14} /> Registrar pago
                                </button>
                                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
                                <button
                                  onClick={() => handleSuspend(business)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                                  style={{ color: business.status === 'suspended' ? 'var(--success)' : 'var(--warning)' }}
                                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <Pause size={14} /> {business.status === 'suspended' ? 'Reactivar' : 'Suspender'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredBusinesses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <img src="/empty-state-businesses.png" alt="" className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No hay negocios</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Crea tu primer negocio para comenzar</p>
            </div>
          )}
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((business, index) => {
            const config = statusConfig[business.status];
            return (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-4 cursor-pointer card-hover"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                onClick={() => navigate(`/businesses/${business.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--bg-surface-hover)' }}
                    >
                      <img 
                        src={business.logoUrl || '/default-business-logo.png'} 
                        alt="" 
                        className="w-6 h-6 object-contain"
                        onError={e => { (e.target as HTMLImageElement).src = '/default-business-logo.png'; }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{business.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{business.domain}</p>
                    </div>
                  </div>
                  <span 
                    className="px-2 py-0.5 rounded-md text-xs font-medium"
                    style={{ backgroundColor: config.bgColor, color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Email</span>
                    <span style={{ color: 'var(--text-secondary)' }} className="truncate max-w-[150px]">{business.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Telefono</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{business.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>Monto/Mes</span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      RD${business.monthlyAmount.toLocaleString('es-DO')}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Business Modal */}
      {showAddModal && <AddBusinessModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

function AddBusinessModal({ onClose }: { onClose: () => void }) {
  const { createBusiness, fetchBusinesses } = useBusinessStore();
  const { showToast } = useUIStore();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    email: '',
    phone: '',
    monthlyAmount: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBusiness({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, ''),
        domain: formData.domain,
        email: formData.email,
        phone: formData.phone,
        monthlyAmount: parseFloat(formData.monthlyAmount) || 0,
        status: 'active',
        logoUrl: '',
        trialEndsAt: null,
        notes: formData.notes,
      });
      showToast({ type: 'success', title: 'Negocio creado', description: `${formData.name} ha sido agregado exitosamente` });
      onClose();
      fetchBusinesses();
    } catch (err) {
      showToast({ type: 'error', title: 'Error', description: 'No se pudo crear el negocio' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !prev.slug) {
        updated.slug = value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      }
      return updated;
    });
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Nuevo Negocio</h2>
          <button onClick={onClose} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre *</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Slug</label>
            <input name="slug" value={formData.slug} onChange={handleChange} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Dominio</label>
            <input name="domain" value={formData.domain} onChange={handleChange} placeholder="ejemplo.com" className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Telefono</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Monto Mensual (RD$)</label>
            <input name="monthlyAmount" type="number" value={formData.monthlyAmount} onChange={handleChange} required className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notas</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
