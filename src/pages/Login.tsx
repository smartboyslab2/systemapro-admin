import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@systemapro.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      showToast({ type: 'error', title: 'Error', description: error });
    }
  }, [error, showToast]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'El correo es requerido';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo invalido';
    if (!password) newErrors.password = 'La contrasena es requerida';
    else if (password.length < 4) newErrors.password = 'Minimo 4 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      return;
    }
    await login(email, password);
    if (!useAuthStore.getState().error) {
      showToast({ type: 'success', title: 'Bienvenido', description: 'Sesion iniciada correctamente' });
      navigate('/');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-60"
          style={{ 
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.08) 0%, transparent 70%)',
            top: '-10%',
            left: '-10%',
            animation: 'float1 20s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-60"
          style={{ 
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.06) 0%, transparent 70%)',
            top: '10%',
            right: '-10%',
            animation: 'float2 25s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[700px] h-[700px] rounded-full blur-[80px] opacity-60"
          style={{ 
            background: 'radial-gradient(circle, rgba(220, 38, 38, 0.06) 0%, transparent 70%)',
            bottom: '-20%',
            left: '20%',
            animation: 'float3 22s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-60"
          style={{ 
            background: 'radial-gradient(circle, rgba(248, 113, 113, 0.06) 0%, transparent 70%)',
            top: '40%',
            left: '40%',
            animation: 'float4 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-[420px] rounded-2xl p-8 sm:p-10 relative z-10 ${shake ? 'animate-shake' : ''}`}
        style={{ 
          backgroundColor: 'var(--bg-surface)', 
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #DC2626, #EF4444)' }}
          >
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>SystemaPro</span>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Iniciar Sesion
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Accede a tu panel de administracion
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Correo electronico
            </label>
            <div className="relative">
              <Mail 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
                placeholder="admin@systemapro.com"
                className="w-full h-11 rounded-lg pl-10 pr-4 text-sm transition-all outline-none input-glow"
                style={{ 
                  backgroundColor: 'var(--bg-input)', 
                  border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-input-focus)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.email ? 'var(--danger)' : 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
              />
            </div>
            {errors.email && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Contrasena
            </label>
            <div className="relative">
              <Lock 
                size={18} 
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
                placeholder="••••••••"
                className="w-full h-11 rounded-lg pl-10 pr-10 text-sm transition-all outline-none input-glow"
                style={{ 
                  backgroundColor: 'var(--bg-input)', 
                  border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border-subtle)'}`,
                  color: 'var(--text-primary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-input-focus)';
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = errors.password ? 'var(--danger)' : 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.password}</p>
            )}
          </div>

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Recordarme</span>
            </label>
            <button type="button" className="text-sm transition-colors" style={{ color: 'var(--accent-primary)' }}>
              Olvidaste tu contrasena?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            style={{ 
              background: 'linear-gradient(135deg, #DC2626, #EF4444)',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!isLoading) e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accediendo...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Iniciar Sesion</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          SystemaPro Admin v1.0
        </p>

        {/* Demo hint */}
        <div 
          className="mt-4 p-3 rounded-lg text-xs text-center"
          style={{ backgroundColor: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}
        >
          <p>Demo: admin@systemapro.com / admin123</p>
        </div>
      </motion.div>
    </div>
  );
}
