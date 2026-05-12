import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, CreditCard, Pause, CheckCircle, Clock, XCircle, FileText, FileImage, Upload, Download, Users, UserPlus, Building, Phone, Mail, DollarSign, MapPin, FileDigit } from 'lucide-react';
import { useBusinessStore } from '@/stores/businessStore';
import { useUIStore } from '@/stores/uiStore';
import { getDocumentsByBusiness, getActivityLogsByBusiness, getPaymentsByBusiness } from '@/lib/mockApi';
import type { Business, Document as DocType, ActivityLog, Payment, BusinessStatus, DocumentCategory, Client } from '@/types';

const statusConfig = {
  active: { color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Activo' },
  trial: { color: '#DC2626', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'Prueba' },
  suspended: { color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Suspendido' },
  cancelled: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Cancelado' },
};

const paymentStatusConfig = {
  completed: { icon: CheckCircle, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Completado' },
  pending: { icon: Clock, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)', label: 'Pendiente' },
  failed: { icon: XCircle, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Fallido' },
  refunded: { icon: XCircle, color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.1)', label: 'Reembolsado' },
};

const docCategoryColors: Record<DocumentCategory, string> = {
  contract: '#DC2626',
  invoice: '#22C55E',
  receipt: '#F59E0B',
  logo: '#DC2626',
  general: '#64748B',
};

const activityIcons: Record<string, { icon: typeof FileText; color: string }> = {
  payment_received: { icon: CheckCircle, color: '#22C55E' },
  status_changed: { icon: Pause, color: '#F59E0B' },
  document_uploaded: { icon: FileText, color: '#DC2626' },
  note_added: { icon: FileText, color: '#64748B' },
  business_created: { icon: CheckCircle, color: '#DC2626' },
  business_updated: { icon: Edit, color: '#DC2626' },
};

const clientStatusConfig = {
  active: { color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Activo' },
  inactive: { color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.1)', label: 'Inactivo' },
  overdue: { color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Atrasado' },
};

const tabs = ['Resumen', 'Clientes', 'Pagos', 'Documentos', 'Actividad'];

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businesses, updateBusiness } = useBusinessStore();
  const { showToast } = useUIStore();
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState('Resumen');
  const [documents, setDocuments] = useState<DocType[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [businessPayments, setBusinessPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Business>>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientPayments, setClientPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (id) {
      const found = businesses.find(b => b.id === id);
      if (found) {
        setBusiness(found);
        setEditForm(found);
        loadDocuments(id);
        loadActivity(id);
        loadPayments(id);
        loadClients(id);
      }
    }
  }, [id, businesses]);

  const loadDocuments = async (businessId: string) => {
    const docs = await getDocumentsByBusiness(businessId);
    setDocuments(docs);
  };

  const loadActivity = async (businessId: string) => {
    const logs = await getActivityLogsByBusiness(businessId);
    setActivityLogs(logs);
  };

  const loadPayments = async (businessId: string) => {
    const payments = await getPaymentsByBusiness(businessId);
    setBusinessPayments(payments);
  };

  const loadClients = async (businessId: string) => {
    const { getClientsByBusiness } = await import('@/lib/mockApi');
    const clientList = await getClientsByBusiness(businessId);
    setClients(clientList);
  };

  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);
    const { getPaymentsByClient } = await import('@/lib/mockApi');
    const payments = await getPaymentsByClient(client.id);
    setClientPayments(payments);
  };

  const handleUpdate = async () => {
    if (!business) return;
    await updateBusiness(business.id, editForm);
    setIsEditing(false);
    showToast({ type: 'success', title: 'Actualizado', description: 'Informacion guardada correctamente' });
  };

  const handleStatusChange = async (newStatus: BusinessStatus) => {
    if (!business) return;
    await updateBusiness(business.id, { status: newStatus });
    setShowStatusDropdown(false);
    showToast({ type: 'success', title: 'Estado actualizado', description: `Estado cambiado a ${statusConfig[newStatus].label}` });
  };

  if (!business) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="shimmer rounded-xl w-full max-w-2xl h-96" />
      </div>
    );
  }

  const status = statusConfig[business.status];
  const sortedPayments = [...businessPayments].sort((a: Payment, b: Payment) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  const totalPaid = businessPayments.filter((p: Payment) => p.status === 'completed').reduce((sum: number, p: Payment) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/businesses')}
        className="flex items-center gap-2 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
      >
        <ArrowLeft size={16} /> Negocios
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-surface-hover)', border: '2px solid var(--border-medium)' }}
          >
            <img 
              src={business.logoUrl || '/default-business-logo.png'} 
              alt="" 
              className="w-10 h-10 object-contain"
              onError={e => { (e.target as HTMLImageElement).src = '/default-business-logo.png'; }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{business.name}</h1>
            <p className="text-sm" style={{ color: 'var(--accent-primary)' }}>{business.domain}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{ backgroundColor: status.bgColor, color: status.color }}
            >
              {status.label}
            </button>
            {showStatusDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowStatusDropdown(false)} />
                <div 
                  className="absolute left-0 top-8 w-40 rounded-lg shadow-lg z-50 py-1"
                  style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  {(Object.keys(statusConfig) as BusinessStatus[]).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className="w-full text-left px-3 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="h-9 px-3 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            <Edit size={14} /> Editar
          </button>
          <button
            onClick={() => navigate('/payments')}
            className="h-9 px-3 rounded-lg text-sm font-medium text-white flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
          >
            <CreditCard size={14} /> Registrar Pago
          </button>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Clientes Activos', value: clients.filter(c => c.status === 'active').length, icon: Users, color: 'var(--success)' },
          { label: 'Ingreso por Rentas', value: `RD$${clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.monthlyRent, 0).toLocaleString('es-DO')}`, icon: DollarSign, color: 'var(--accent-primary)' },
          { label: 'Licencias Totales', value: clients.reduce((sum, c) => sum + c.licenseCount, 0), icon: CheckCircle, color: 'var(--text-secondary)' },
          { label: 'Atrasados', value: clients.filter(c => c.status === 'overdue').length, icon: Clock, color: 'var(--danger)' },
          { label: 'Total Pagado', value: `RD$${totalPaid.toLocaleString('es-DO')}` },
          { label: 'Documentos', value: documents.length },
        ].map((stat, i) => (
          <div key={i} className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-1">
              {stat.icon && <stat.icon size={12} style={{ color: stat.color || 'var(--text-muted)' }} />}
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
            <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-3 text-sm font-medium transition-colors relative"
            style={{
              color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="business-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'Resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Informacion General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre', key: 'name', value: business.name },
                    { label: 'Slug', key: 'slug', value: business.slug },
                    { label: 'Dominio', key: 'domain', value: business.domain },
                    { label: 'Email', key: 'email', value: business.email },
                    { label: 'Telefono', key: 'phone', value: business.phone },
                    { label: 'Monto Mensual', key: 'monthlyAmount', value: `RD$${business.monthlyAmount}` },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                      {isEditing ? (
                        <input
                          value={editForm[field.key as keyof Business] || ''}
                          onChange={e => setEditForm(p => ({ ...p, [field.key]: e.target.value }))}
                          className="w-full h-9 rounded-lg px-3 text-sm outline-none"
                          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                        />
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{field.value}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notas</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.notes || ''}
                      onChange={e => setEditForm(p => ({ ...p, notes: e.target.value }))}
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{business.notes || 'Sin notas'}</p>
                  )}
                </div>
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button onClick={() => { setIsEditing(false); setEditForm(business); }} className="h-9 px-4 rounded-lg text-sm" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancelar</button>
                    <button onClick={handleUpdate} className="h-9 px-6 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}>Guardar</button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Alertas</h3>
                {business.status === 'suspended' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <Pause size={16} style={{ color: '#F59E0B' }} />
                    <p className="text-sm" style={{ color: '#F59E0B' }}>Negocio suspendido</p>
                  </div>
                )}
                {business.status === 'trial' && business.trialEndsAt && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                    <Clock size={16} style={{ color: '#DC2626' }} />
                    <p className="text-sm" style={{ color: '#DC2626' }}>
                      Trial expira el {new Date(business.trialEndsAt).toLocaleDateString('es-DO')}
                    </p>
                  </div>
                )}
                {business.status === 'active' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                    <CheckCircle size={16} style={{ color: '#22C55E' }} />
                    <p className="text-sm" style={{ color: '#22C55E' }}>Negocio activo y al dia</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: CLIENTES ==================== */}
        {activeTab === 'Clientes' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Clientes que rentan el sistema</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {clients.length} registrados — {clients.filter(c => c.status === 'active').length} activos — {clients.filter(c => c.status === 'overdue').length} atrasados
                </p>
              </div>
              <button
                onClick={() => setShowAddClientModal(true)}
                className="h-9 px-4 rounded-lg text-sm font-semibold text-white flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
              >
                <UserPlus size={14} /> Agregar Cliente
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="rounded-xl p-8 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <Users size={48} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Sin clientes registrados</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Los clientes son los negocios que rentan usuarios de este sistema</p>
                <button onClick={() => setShowAddClientModal(true)} className="mt-4 h-9 px-4 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>Agregar primer cliente</button>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Cliente</th>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden lg:table-cell" style={{ color: 'var(--text-muted)' }}>Contacto</th>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>RNC</th>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Renta</th>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Lic.</th>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
                        <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Ultimo Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((client: Client, index: number) => {
                        const cConfig = clientStatusConfig[client.status];
                        return (
                          <motion.tr
                            key={client.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="transition-colors cursor-pointer"
                            style={{ borderBottom: '1px solid var(--border-subtle)' }}
                            onClick={() => handleSelectClient(client)}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cConfig.bgColor }}>
                                  <Building size={16} style={{ color: cConfig.color }} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{client.name}</p>
                                  <p className="text-xs truncate max-w-[200px]" style={{ color: 'var(--text-muted)' }}>{client.address}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{client.contactName}</p>
                              <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Mail size={10} /> {client.email}</p>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{client.rnc || '—'}</span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>RD${client.monthlyRent.toLocaleString('es-DO')}</p>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{client.licenseCount}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: cConfig.bgColor, color: cConfig.color }}>
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cConfig.color }} /> {cConfig.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <p className="text-xs" style={{ color: client.lastPaymentDate ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                                {client.lastPaymentDate ? new Date(client.lastPaymentDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' }) : 'Sin pagos'}
                              </p>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile cards */}
            <div className="grid grid-cols-1 sm:hidden gap-3">
              {clients.map((client: Client) => {
                const cConfig = clientStatusConfig[client.status];
                return (
                  <div key={client.id} onClick={() => handleSelectClient(client)} className="rounded-lg p-4 cursor-pointer" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{client.name}</p>
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: cConfig.bgColor, color: cConfig.color }}>{cConfig.label}</span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{client.contactName}</p>
                    <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-primary)' }}>RD${client.monthlyRent.toLocaleString('es-DO')}/mes</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.licenseCount} lic.</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ======== CLIENT DETAIL PANEL (Drawer) ======== */}
            <AnimatePresence>
              {selectedClient && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm"
                    onClick={() => setSelectedClient(null)}
                  />
                  {/* Panel */}
                  <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed top-0 right-0 bottom-0 w-full sm:w-[480px] lg:w-[540px] z-[80] overflow-y-auto"
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      borderLeft: '1px solid var(--border-subtle)',
                    }}
                  >
                    <ClientDetailPanel
                      client={selectedClient}
                      payments={clientPayments}
                      onClose={() => setSelectedClient(null)}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {showAddClientModal && (
          <AddClientModal
            businessId={business!.id}
            onClose={() => setShowAddClientModal(false)}
            onSaved={() => { loadClients(business!.id); setShowAddClientModal(false); }}
          />
        )}

        {activeTab === 'Pagos' && (
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            {sortedPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <CreditCard size={48} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Sin pagos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>ID</th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Monto</th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>Metodo</th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Periodo</th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase hidden md:table-cell" style={{ color: 'var(--text-muted)' }}>Fecha</th>
                      <th className="text-left py-3 px-4 text-xs font-medium uppercase" style={{ color: 'var(--text-muted)' }}>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPayments.map((payment: Payment) => {
                      const config = paymentStatusConfig[payment.status];
                      const StatusIcon = config.icon;
                      return (
                        <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td className="py-3 px-4 text-sm font-mono" style={{ color: 'var(--text-muted)' }}>#{payment.id.slice(-4)}</td>
                          <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>RD${payment.amount.toLocaleString('es-DO')}</td>
                          <td className="py-3 px-4 text-sm capitalize hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{payment.paymentMethod}</td>
                          <td className="py-3 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(payment.periodStart).toLocaleDateString('es-DO', { month: 'short' })} - {new Date(payment.periodEnd).toLocaleDateString('es-DO', { month: 'short' })}
                          </td>
                          <td className="py-3 px-4 text-sm hidden md:table-cell" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(payment.paymentDate).toLocaleDateString('es-DO')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: config.bgColor, color: config.color }}>
                              <StatusIcon size={12} /> {config.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Documentos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {documents.map((doc: DocType) => {
                const isImage = doc.fileType.startsWith('image/');
                return (
                  <div
                    key={doc.id}
                    className="rounded-xl p-4 card-hover"
                    style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div className="flex items-center justify-center h-20 mb-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                      {isImage ? <FileImage size={32} style={{ color: docCategoryColors[doc.category] }} /> : <FileText size={32} style={{ color: docCategoryColors[doc.category] }} />}
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${docCategoryColors[doc.category]}15`, color: docCategoryColors[doc.category] }}>
                        {doc.category}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {(doc.fileSize / 1024).toFixed(0)}KB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs transition-colors" style={{ color: 'var(--accent-primary)', backgroundColor: 'rgba(220, 38, 38, 0.08)' }}>
                        <Download size={12} /> Descargar
                      </button>
                    </div>
                  </div>
                );
              })}
              {/* Upload Card */}
              <div
                className="rounded-xl p-4 border-dashed border-2 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[180px]"
                style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.03)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Upload size={24} />
                <p className="text-xs mt-2 text-center">Subir documento</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Actividad' && (
          <div className="space-y-0">
            {activityLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock size={48} style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Sin actividad registrada</p>
              </div>
            ) : (
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-[11px] top-0 bottom-0 w-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
                {activityLogs.map((log, index) => {
                  const config = activityIcons[log.action] || activityIcons.note_added;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pb-6"
                    >
                      {/* Timeline node */}
                      <div 
                        className="absolute left-[-17px] top-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}20`, border: `2px solid ${config.color}` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
                      </div>
                      <div className="ml-4">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleDateString('es-DO', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{log.details.description}</p>
                        {log.details.oldValue && log.details.newValue && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            {log.details.oldValue} → {log.details.newValue}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== CLIENT DETAIL PANEL ==================== */
function ClientDetailPanel({ client, payments, onClose }: { client: Client; payments: Payment[]; onClose: () => void }) {
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payments.filter(p => p.status === 'completed').length;
  const lastPayment = payments.find(p => p.status === 'completed');
  const daysSinceLastPayment = lastPayment
    ? Math.floor((Date.now() - new Date(lastPayment.paymentDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

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
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.licenseCount} licencia{client.licenseCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ color: 'var(--text-muted)' }}>
          <XCircle size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Pagado', value: `RD$${totalPaid.toLocaleString('es-DO')}`, accent: true },
            { label: 'Pagos Completados', value: completedCount },
            { label: 'Renta Mensual', value: `RD$${client.monthlyRent.toLocaleString('es-DO')}`, accent: true },
            { label: 'Dias sin Pagar', value: daysSinceLastPayment !== null ? `${daysSinceLastPayment} dias` : 'N/A', danger: daysSinceLastPayment !== null && daysSinceLastPayment > 30 },
          ].map((stat, i) => (
            <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <p className="text-base font-bold" style={{
                color: stat.danger ? 'var(--danger)' : stat.accent ? 'var(--accent-primary)' : 'var(--text-primary)'
              }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Client Info */}
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Informacion del Cliente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={<Mail size={14} />} label="Correo" value={client.email || '—'} />
            <InfoRow icon={<Phone size={14} />} label="Telefono" value={client.phone || '—'} />
            <InfoRow icon={<MapPin size={14} />} label="Direccion" value={client.address || '—'} />
            <InfoRow icon={<FileDigit size={14} />} label="RNC" value={client.rnc || '—'} />
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
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Historial de Pagos</h3>
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
                    {payments.map((payment: Payment) => {
                      const pConfig = paymentStatusConfig[payment.status];
                      const PIcon = pConfig.icon;
                      return (
                        <tr key={payment.id} className="transition-colors" style={{ borderBottom: '1px solid var(--border-subtle)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td className="py-2.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(payment.periodStart).toLocaleDateString('es-DO', { month: 'short' })} - {new Date(payment.periodEnd).toLocaleDateString('es-DO', { month: 'short' })}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>RD${payment.amount.toLocaleString('es-DO')}</td>
                          <td className="py-2.5 px-4 text-sm capitalize hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{payment.paymentMethod}</td>
                          <td className="py-2.5 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{new Date(payment.paymentDate).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' })}</td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: pConfig.bgColor, color: pConfig.color }}>
                              <PIcon size={10} /> {pConfig.label}
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

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span style={{ color: 'var(--text-muted)', marginTop: 2 }}>{icon}</span>
      <div>
        <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

/* ==================== ADD CLIENT MODAL ==================== */
function AddClientModal({ businessId, onClose, onSaved }: { businessId: string; onClose: () => void; onSaved: () => void }) {
  const { showToast } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    monthlyRent: '',
    licenseCount: '1',
    address: '',
    rnc: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.monthlyRent) return;
    setIsSubmitting(true);
    try {
      const { createClient } = await import('@/lib/mockApi');
      await createClient({
        businessId,
        name: form.name,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        monthlyRent: parseFloat(form.monthlyRent),
        status: 'active',
        licenseCount: parseInt(form.licenseCount) || 1,
        address: form.address,
        rnc: form.rnc,
        notes: form.notes,
        lastPaymentDate: null,
      });
      showToast({ type: 'success', title: 'Cliente agregado', description: `${form.name} ha sido registrado exitosamente` });
      onSaved();
    } catch {
      showToast({ type: 'error', title: 'Error', description: 'No se pudo registrar el cliente' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = "w-full h-10 rounded-lg px-3 text-sm outline-none transition-all";
  const inputCSS = { backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg rounded-xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}
      >
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Agregar Cliente</h2>
        <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Registra un nuevo negocio que rentara el sistema</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre del Negocio *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ej: Supermercado Bravo" className={inputStyle} style={inputCSS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Persona de Contacto</label>
              <input value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} placeholder="Nombre completo" className={inputStyle} style={inputCSS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Telefono</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="809-555-0000" className={inputStyle} style={inputCSS} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Correo Electronico</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="cliente@ejemplo.com" className={inputStyle} style={inputCSS} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Renta Mensual (RD$) *</label>
              <input type="number" value={form.monthlyRent} onChange={e => setForm(p => ({ ...p, monthlyRent: e.target.value }))} required placeholder="2500" className={inputStyle} style={inputCSS} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Num. de Licencias</label>
              <input type="number" min="1" value={form.licenseCount} onChange={e => setForm(p => ({ ...p, licenseCount: e.target.value }))} className={inputStyle} style={inputCSS} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Direccion</label>
            <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Av. Principal, Santo Domingo" className={inputStyle} style={inputCSS} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>RNC</label>
            <input value={form.rnc} onChange={e => setForm(p => ({ ...p, rnc: e.target.value }))} placeholder="101-XXXXX-X" className={inputStyle} style={inputCSS} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notas</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className={`${inputStyle} py-2 resize-none`} style={inputCSS} placeholder="Informacion adicional..." />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-sm font-medium" style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-lg text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
