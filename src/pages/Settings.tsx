import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, CreditCard, Wallet, Bell, Database, Eye, EyeOff, Copy, Download } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { getSettings, updateSettings, exportBusinessesCSV, exportPaymentsCSV } from '@/lib/mockApi';
import type { AppSettings } from '@/lib/mockApi';

const settingsNav = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'stripe', label: 'Stripe', icon: CreditCard },
  { id: 'paypal', label: 'PayPal', icon: Wallet },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'backup', label: 'Respaldo', icon: Database },
];

export default function Settings() {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await getSettings();
      setSettings(data);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async (partial: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await updateSettings(partial);
    showToast({ type: 'success', title: 'Configuracion guardada' });
  };

  const handleExport = async (type: 'businesses' | 'payments') => {
    try {
      const csv = type === 'businesses' ? await exportBusinessesCSV() : await exportPaymentsCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast({ type: 'success', title: 'Exportacion completa', description: `Archivo ${type}.csv descargado` });
    } catch {
      showToast({ type: 'error', title: 'Error', description: 'No se pudo exportar' });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="shimmer rounded-xl h-64 hidden lg:block" style={{ backgroundColor: 'var(--bg-surface)' }} />
        <div className="lg:col-span-3 shimmer rounded-xl h-96" style={{ backgroundColor: 'var(--bg-surface)' }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Settings Nav - Sidebar */}
      <div className="hidden lg:block">
        <div className="rounded-xl p-3 space-y-1" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          {settingsNav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeSection === item.id ? 'rgba(220, 38, 38, 0.08)' : 'transparent',
                color: activeSection === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1">
          {settingsNav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                backgroundColor: activeSection === item.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: activeSection === item.id ? '#fff' : 'var(--text-secondary)',
                border: activeSection === item.id ? 'none' : '1px solid var(--border-subtle)',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="lg:col-span-3"
      >
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Perfil de Administrador</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden" style={{ border: '2px solid var(--border-medium)' }}>
                <img src={user?.avatar || '/avatar-admin.jpg'} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
                <p className="text-xs px-2 py-0.5 rounded-full inline-block mt-1" style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--accent-primary)' }}>
                  Super Admin
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre</label>
                <input defaultValue={user?.name} className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Correo Electronico</label>
                <input defaultValue={user?.email} type="email" className="w-full h-10 rounded-lg px-3 text-sm outline-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }} />
              </div>
              <div className="pt-2">
                <button 
                  className="h-10 px-6 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
                  onClick={() => showToast({ type: 'success', title: 'Perfil actualizado' })}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stripe Section */}
        {activeSection === 'stripe' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Configuracion de Stripe</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Configura las credenciales de Stripe para procesar pagos</p>
            
            <div className="space-y-4">
              <StripeInput label="Publishable Key" value={settings.stripePublishableKey} onChange={v => handleSaveSettings({ stripePublishableKey: v })} />
              <StripeInput label="Secret Key" value={settings.stripeSecretKey} onChange={v => handleSaveSettings({ stripeSecretKey: v })} isSecret />
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Modo</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSaveSettings({ stripeMode: 'test' })}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: settings.stripeMode === 'test' ? 'rgba(220, 38, 38, 0.08)' : 'var(--bg-input)',
                      color: settings.stripeMode === 'test' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Test
                  </button>
                  <button
                    onClick={() => handleSaveSettings({ stripeMode: 'live' })}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: settings.stripeMode === 'live' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-input)',
                      color: settings.stripeMode === 'live' ? 'var(--success)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    Live
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Webhook URL</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>
                    https://api.systemapro.com/webhooks/stripe
                  </code>
                  <button 
                    onClick={() => { navigator.clipboard.writeText('https://api.systemapro.com/webhooks/stripe'); showToast({ type: 'success', title: 'URL copiada' }); }}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PayPal Section */}
        {activeSection === 'paypal' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Configuracion de PayPal</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Configura las credenciales de PayPal para pagos alternativos</p>
            
            <div className="space-y-4">
              <StripeInput label="Client ID" value={settings.paypalClientId} onChange={v => handleSaveSettings({ paypalClientId: v })} />
              <StripeInput label="Secret" value={settings.paypalSecret} onChange={v => handleSaveSettings({ paypalSecret: v })} isSecret />
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Modo</label>
                <div className="flex items-center gap-3">
                  {(['sandbox', 'live'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => handleSaveSettings({ paypalMode: mode })}
                      className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                      style={{
                        backgroundColor: settings.paypalMode === mode ? 'rgba(220, 38, 38, 0.08)' : 'var(--bg-input)',
                        color: settings.paypalMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Notificaciones</h2>
            <div className="space-y-4">
              {[
                { key: 'notifyPaymentReceived', label: 'Pago recibido', desc: 'Recibe notificacion cuando se registre un pago' },
                { key: 'notifyPaymentOverdue', label: 'Pago vencido', desc: 'Alerta cuando un negocio tenga pagos vencidos' },
                { key: 'notifyTrialExpiring', label: 'Trial expirando', desc: 'Notificacion cuando un periodo de prueba este por vencer' },
                { key: 'notifyWeeklySummary', label: 'Resumen semanal', desc: 'Recibe un resumen semanal de actividad' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings[item.key as keyof AppSettings] as boolean} 
                    onChange={v => handleSaveSettings({ [item.key]: v })} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Section */}
        {activeSection === 'backup' && (
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Respaldo de Datos</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Exporta la base de datos para respaldo o analisis</p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Negocios (CSV)</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Exporta todos los negocios con su informacion</p>
                  </div>
                  <button
                    onClick={() => handleExport('businesses')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--accent-primary)' }}
                  >
                    <Download size={16} /> Exportar
                  </button>
                </div>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-surface-hover)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Pagos (CSV)</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Exporta todo el historial de pagos</p>
                  </div>
                  <button
                    onClick={() => handleExport('payments')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: 'rgba(220, 38, 38, 0.08)', color: 'var(--accent-primary)' }}
                  >
                    <Download size={16} /> Exportar
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <p className="text-xs" style={{ color: 'var(--warning)' }}>
                  Ultimo respaldo: {new Date().toLocaleDateString('es-DO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StripeInput({ label, value, onChange, isSecret }: { label: string; value: string; onChange: (v: string) => void; isSecret?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <div className="relative">
        <input
          type={isSecret && !show ? 'password' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full h-10 rounded-lg px-3 pr-10 text-sm outline-none font-mono"
          style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="relative w-10 h-6 rounded-full transition-colors duration-200"
      style={{ backgroundColor: enabled ? 'var(--accent-primary)' : 'var(--bg-surface-hover)' }}
    >
      <div
        className="absolute top-1 w-4 h-4 rounded-full transition-transform duration-200"
        style={{
          backgroundColor: enabled ? '#fff' : 'var(--text-muted)',
          transform: enabled ? 'translateX(20px)' : 'translateX(4px)',
        }}
      />
    </button>
  );
}
