import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, CreditCard, Building2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fabActions = [
  { label: 'Nuevo Cliente', icon: Users, path: '/clients', color: 'var(--accent-primary)', desc: 'Registrar un cliente que rentara tu sistema' },
  { label: 'Registrar Pago', icon: CreditCard, path: '/clients', color: 'var(--success)', desc: 'Aplicar pago a un cliente existente' },
  { label: 'Nuevo Negocio', icon: Building2, path: '/businesses', color: 'var(--text-secondary)', desc: 'Agregar un nuevo sistema POS' },
  { label: 'Subir Documento', icon: FileText, path: '/documents', color: 'var(--warning)', desc: 'Subir contrato o recibo' },
];

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-end gap-2 mb-1"
          >
            {fabActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { navigate(action.path); setOpen(false); }}
                className="flex items-center gap-3 group"
              >
                <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs font-medium px-3 py-1 rounded-lg shadow-lg whitespace-nowrap"
                    style={{ backgroundColor: 'var(--bg-surface)', color: action.color, border: '1px solid var(--border-subtle)' }}>
                    {action.label}
                  </p>
                  <p className="text-[10px] px-3 py-0.5 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{action.desc}</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  style={{ backgroundColor: `${action.color}18` }}>
                  <action.icon size={18} style={{ color: action.color }} />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-shadow"
        style={{
          background: 'linear-gradient(135deg, #DC2626, #EF4444)',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.25)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div animate={{ rotate: open ? 135 : 0 }} transition={{ duration: 0.25 }}>
          <Plus size={24} className="text-white" />
        </motion.div>
      </motion.button>
    </div>
  );
}
