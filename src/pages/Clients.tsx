import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, Building, Phone, Mail, MapPin,
  CreditCard, ArrowRight, CheckCircle, Clock, XCircle, FileDigit, Filter
} from 'lucide-react';
import { getClients } from '@/lib/mockApi';
import { getBusinesses } from '@/lib/mockApi';
import { useUIStore } from '@/stores/uiStore';
import type { Client as ClientType, Payment, Business } from '@/types';

const clientStatusConfig = {
  active: { color: 'var(--success)', bgColor: 'var(--success-bg)', label: 'Activo' },
  inactive: { color: 'var(--text-muted)', bgColor: 'var(--bg-surface-hover)', label: 'Inactivo' },
  overdue: { color: 'var(--danger)', bgColor: 'var(--danger-bg)', label: 'Atrasado' },
};

const paymentStatusConfig = {
  completed: { color: 'var(--success)', bgColor: 'var(--success-bg)', label: 'Completado' },
  pending: { color: 'var(--warning)', bgColor: 'var(--warning-bg)', label: 'Pendiente' },
  failed: { color: 'var(--danger)', bgColor: 'var(--danger-bg)', label: 'Fallido' },
  refunded: { color: 'var(--text-muted)', bgColor: 'var(--bg-surface-hover)', label: 'Reembolsado' },
};

export default function Clients() {
  const [allClients, setAllClients] = useState<ClientType[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'overdue' | 'inactive'>('all');
  const [businessFilter, setBusinessFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientType | null>(null);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState<ClientType | null>(null);
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [clientsList, bizList] = await Promise.all([getClients(), getBusinesses()]);
    setAllClients(clientsList);
    setBusinesses(bizList);
    setIsLoading(false);
  };

  const getBusinessName = (id: string) => businesses.find(b => b.id === id)?.name || id;

  // Stats
  const activeClients = allClients.filter(c => c.status === 'active').length;
  const overdueClients = allClients.filter(c => c.status === 'overdue').length;
  const totalMonthlyRent = allClients.filter(c => c.status === 'active').reduce((s, c) => s + c.monthlyRent, 0);
  const totalLicenses = allClients.reduce((s, c) => s + c.licenseCount, 0);

  // Filtered
  const filtered = useMemo(() => {
    return allClients.filter(c => {
      const m1 = statusFilter === 'all' || c.status === statusFilter;
      const m2 = businessFilter === 'all' || c.businessId === businessFilter;
      const q = search.toLowerCase();
      const m3 = !q || c.name.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      return m1 && m2 && m3;
    });
  }, [allClients, statusFilter, businessFilter, search]);

  // Select client -> load payments
  const handleSelectClient = async (client: ClientType) => {
    setSelectedClient(client);
    const { getPaymentsByClient } = await import('@/lib/mockApi');
    const payments = await getPaymentsByClient(client.id);
    setClientPayments(payments);
  };

  const openPaymentModal = (client: ClientType) => {
    setPaymentTarget(client);
    setShowPaymentModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer rounded-xl h-28" style={{ backgroundColor: 'var(--bg-surface)' }} />
          ))}
        </div>
        <div className="shimmer rounded-xl h-96" style={{ backgroundColor: 'var(--bg-surface)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ====== STATS ====== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Clientes Activos', value: activeClients, sub: `${allClients.length} total`, accent: 'var(--success)' },
          { label: 'Ingreso Mensual por Rentas', value: `RD$${totalMonthlyRent.toLocaleString('es-DO')}`, sub: `${allClients.length} clientes`, accent: 'var(--accent-primary)' },
          { label: 'Clientes Atrasados', value: overdueClients, sub: 'Requieren atencion', accent: 'var(--danger)' },
          { label: 'Licencias Totales', value: totalLicenses, sub: 'Activas en el sistema', accent: 'var(--text-secondary)' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl p-5"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.03em' }}>{stat.label}</p>
            <p className="text-2xl font-bold" style={{ color: stat.accent }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ====== FILTER BAR ====== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full sm:w-auto">
          {(['all', 'active', 'overdue', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: statusFilter === s ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
                border: statusFilter === s ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {s === 'all' ? 'Todos' : clientStatusConfig[s].label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, backgroundColor: 'var(--border-subtle)', margin: '0 4px', flexShrink: 0 }} />
          <Filter size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={businessFilter}
            onChange={e => setBusinessFilter(e.target.value)}
            className="h-8 rounded-lg px-2 text-xs outline-none cursor-pointer"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <option value="all">Todos los negocios</option>
            {businesses.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full sm:w-56 h-10 rounded-lg pl-9 pr-4 text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>
      </div>

      {/* ====== TABLE ====== */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Cliente</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Contacto</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Negocio</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Renta</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Lic.</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
                <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client: ClientType, index: number) => {
                const cConfig = clientStatusConfig[client.status];
                return (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                    className="transition-colors group"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Name */}
                    <td className="py-3 px-4 cursor-pointer" onClick={() => handleSelectClient(client)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cConfig.bgColor }}>
                          <Building size={16} style={{ color: cConfig.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{client.name}</p>
                          <p className="text-xs truncate max-w-[180px]" style={{ color: 'var(--text-muted)' }}>{client.address}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{client.contactName}</p>
                      <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Mail size={10} /> {client.email}</p>
                    </td>
                    {/* Business */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/businesses/${client.businessId}?tab=clientes`)}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
                        style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)' }}
                      >
                        {getBusinessName(client.businessId)}
                        <ArrowRight size={10} />
                      </button>
                    </td>
                    {/* Rent */}
                    <td className="py-3 px-4">
                      <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>RD${client.monthlyRent.toLocaleString('es-DO')}</p>
                    </td>
                    {/* Licenses */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{client.licenseCount}</span>
                    </td>
                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: cConfig.bgColor, color: cConfig.color }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cConfig.color }} /> {cConfig.label}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSelectClient(client)}
                          className="p-2 rounded-lg text-xs transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          title="Ver detalle"
                        >
                          <Users size={14} />
                        </button>
                        <button
                          onClick={() => openPaymentModal(client)}
                          className="p-2 rounded-lg text-xs transition-colors"
                          style={{ color: 'var(--success)' }}
                          title="Registrar pago"
                        >
                          <CreditCard size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Users size={48} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Sin clientes encontrados</p>
          </div>
        )}
      </div>

      {/* ====== CLIENT DETAIL PANEL ====== */}
      <AnimatePresence>
        {selectedClient && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
              onClick={() => setSelectedClient(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] lg:w-[540px] z-[80] overflow-y-auto"
              style={{ backgroundColor: 'var(--bg-primary)', borderLeft: '1px solid var(--border-subtle)' }}
            >
              <ClientDetailPanel
                client={selectedClient}
                payments={clientPayments}
                businessName={getBusinessName(selectedClient.businessId)}
                onClose={() => setSelectedClient(null)}
                onRegisterPayment={() => { setSelectedClient(null); openPaymentModal(selectedClient); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ====== PAYMENT MODAL ====== */}
      {showPaymentModal && paymentTarget && (
        <ClientPaymentModal
          client={paymentTarget}
          onClose={() => setShowPaymentModal(false)}
          onSaved={() => { setShowPaymentModal(false); showToast({ type: 'success', title: 'Pago registrado', description: `Pago registrado para ${paymentTarget.name}` }); }}
        />
      )}
    </div>
  );
}

/* ==================== CLIENT DETAIL PANEL ==================== */
function ClientDetailPanel({ client, payments, businessName, onClose, onRegisterPayment }: {
  client: ClientType; payments: Payment[]; businessName: string; onClose: () => void; onRegisterPayment: () => void;
}) {
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const lastPayment = payments.find(p => p.status === 'completed');
  const daysSince = lastPayment ? Math.floor((Date.now() - new Date(lastPayment.paymentDate).getTime()) / (1000 * 60 * 60 * 24)) : null;
  const cConfig = clientStatusConfig[client.status];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between p-5 sm:p-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: cConfig.bgColor }}>
            <Building size={22} style={{ color: cConfig.color }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{client.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium" style={{ backgroundColor: cConfig.bgColor, color: cConfig.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cConfig.color }} /> {cConfig.label}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.licenseCount} lic.</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)' }}>{businessName}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: 'var(--text-muted)' }}><XCircle size={18} /></button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Pagado', value: `RD$${totalPaid.toLocaleString('es-DO')}`, accent: 'var(--accent-primary)' },
            { label: 'Pagos Recibidos', value: `${completedCount}`, accent: 'var(--success)' },
            { label: 'Renta Mensual', value: `RD$${client.monthlyRent.toLocaleString('es-DO')}`, accent: 'var(--accent-primary)' },
            { label: 'Ultimo Pago', value: daysSince !== null ? `Hace ${daysSince} dias` : 'Nunca', accent: daysSince && daysSince > 30 ? 'var(--danger)' : 'var(--text-secondary)' },
          ].map((s, i) => (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="text-base font-bold" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Informacion</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: <Users size={14} />, label: 'Contacto', value: client.contactName },
              { icon: <Mail size={14} />, label: 'Email', value: client.email || '—' },
              { icon: <Phone size={14} />, label: 'Telefono', value: client.phone || '—' },
              { icon: <MapPin size={14} />, label: 'Direccion', value: client.address || '—' },
              { icon: <FileDigit size={14} />, label: 'RNC', value: client.rnc || '—' },
              { icon: <Building size={14} />, label: 'Sistema', value: businessName },
            ].map((row, i) => (
              <div key={i} className="flex items-start gap-2">
                <span style={{ color: 'var(--text-muted)', marginTop: 2 }}>{row.icon}</span>
                <div>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{row.label}</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{row.value}</p>
                </div>
              </div>
            ))}
          </div>
          {client.notes && (
            <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notas</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{client.notes}</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Historial de Pagos</h3>
            <button onClick={onRegisterPayment}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-white flex items-center gap-1"
              style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}>
              <CreditCard size={12} /> Registrar Pago
            </button>
          </div>
          {payments.length === 0 ? (
            <div className="rounded-xl p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <CreditCard size={32} style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Sin pagos registrados</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Periodo</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Monto</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Metodo</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Fecha</th>
                      <th className="text-left py-2.5 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p: Payment) => {
                      const cfg = paymentStatusConfig[p.status];
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td className="py-2.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(p.periodStart).toLocaleDateString('es-DO', { month: 'short' })} - {new Date(p.periodEnd).toLocaleDateString('es-DO', { month: 'short' })}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>RD${p.amount.toLocaleString('es-DO')}</td>
                          <td className="py-2.5 px-4 text-sm capitalize hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{p.paymentMethod}</td>
                          <td className="py-2.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(p.paymentDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}</td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: cfg.bgColor, color: cfg.color }}>
                              {p.status === 'completed' ? <CheckCircle size={10} /> : p.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== CLIENT PAYMENT MODAL ==================== */
function ClientPaymentModal({ client, onClose, onSaved }: { client: ClientType; onClose: () => void; onSaved: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    amount: client.monthlyRent.toString(),
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    notes: '',
  });
  const inputStyle = "w-full h-10 rounded-lg px-3 text-sm outline-none transition-all";
  const inputCSS = { backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount) return;
    setIsSubmitting(true);
    try {
      const { createPayment } = await import('@/lib/mockApi');
      await createPayment({
        businessId: client.businessId,
        clientId: client.id,
        amount: parseFloat(form.amount),
        paymentMethod: form.paymentMethod as 'stripe' | 'paypal' | 'cash' | 'transfer',
        status: 'completed',
        paymentDate: new Date(form.paymentDate).toISOString(),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        notes: form.notes,
        stripePaymentIntentId: null,
        paypalOrderId: null,
        receiptUrl: null,
      });
      onSaved();
    } catch {
      // handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Registrar Pago</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Cliente: <span className="font-medium" style={{ color: 'var(--accent-primary)' }}>{client.name}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Monto (RD$) *</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required className={inputStyle} style={inputCSS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Metodo</label>
              <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className={inputStyle} style={inputCSS}>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha de Pago</label>
            <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))} className={inputStyle} style={inputCSS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Periodo Inicio</label>
              <input type="date" value={form.periodStart} onChange={e => setForm(p => ({ ...p, periodStart: e.target.value }))} className={inputStyle} style={inputCSS} /></div>
            <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Periodo Fin</label>
              <input type="date" value={form.periodEnd} onChange={e => setForm(p => ({ ...p, periodEnd: e.target.value }))} className={inputStyle} style={inputCSS} /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputStyle} py-2 resize-none`} style={inputCSS} /></div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
