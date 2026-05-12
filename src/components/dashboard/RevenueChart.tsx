import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMonthlyRevenue } from '@/lib/mockApi';
import type { MonthlyRevenue } from '@/lib/mockApi';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div 
      className="rounded-lg px-3 py-2 shadow-lg"
      style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
        RD${payload[0].value.toLocaleString('es-DO')}
      </p>
    </div>
  );
}

export default function RevenueChart() {
  const [data, setData] = useState<MonthlyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const revenue = await getMonthlyRevenue();
      setData(revenue);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="rounded-xl p-5 h-[360px]" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div className="shimmer rounded-lg h-full" />
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Ingresos por Mes</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ultimos 12 meses</p>
        </div>
        <select 
          className="text-xs rounded-lg px-2 py-1 cursor-pointer"
          style={{ 
            backgroundColor: 'var(--bg-input)', 
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        >
          <option>2025</option>
          <option>2024</option>
        </select>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#DC2626" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
              <filter id="lineShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#DC2626" floodOpacity="0.2" />
              </filter>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--chart-grid)" 
              vertical={false}
            />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#DC2626" 
              strokeWidth={2}
              fill="url(#revenueGradient)"
              activeDot={{ r: 6, fill: '#fff', stroke: '#DC2626', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
