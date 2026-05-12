import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  value: string | number;
  label: string;
  trend?: string;
  trendColor?: string;
  index: number;
}

export default function StatCard({ icon: Icon, iconColor, iconBgColor, value, label, trend, trendColor, index }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const prefix = typeof value === 'string' ? value.match(/^[^0-9]*/)?.[0] || '' : '';
    const suffix = typeof value === 'string' ? value.match(/[^0-9.]*$/)?.[0] || '' : '';
    const isCurrency = prefix.includes('$') || prefix.includes('RD');

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericValue * eased;

      if (isCurrency) {
        setDisplayValue(`${prefix}${Math.round(current).toLocaleString('es-DO')}${suffix}`);
      } else {
        setDisplayValue(`${prefix}${Math.round(current)}${suffix}`);
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(String(value));
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="rounded-xl p-5 card-hover"
      style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p 
            className="text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-secondary)', letterSpacing: '0.03em' }}
          >
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {displayValue}
          </p>
          {trend && (
            <p className="text-xs mt-1 font-medium" style={{ color: trendColor || 'var(--text-muted)' }}>
              {trend}
            </p>
          )}
        </div>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: iconBgColor }}
        >
          <Icon size={20} style={{ color: iconColor }} />
        </div>
      </div>
    </motion.div>
  );
}
