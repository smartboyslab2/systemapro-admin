import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getStatusDistribution } from '@/lib/mockApi';
import type { StatusDistribution as StatusDistType } from '@/lib/mockApi';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div 
      className="rounded-lg px-3 py-2 shadow-lg"
      style={{ 
        backgroundColor: 'var(--bg-surface)', 
        border: '1px solid var(--border-subtle)',
      }}
    >
      <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  );
}

export default function StatusDistribution() {
  const [data, setData] = useState<StatusDistType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const distribution = await getStatusDistribution();
      setData(distribution);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const total = data.reduce((sum, item) => sum + item.value, 0);

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
      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Distribucion de Estados</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Negocios por estado</p>
      
      <div className="h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                  style={{ transition: 'opacity 200ms', cursor: 'pointer' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{total}</span>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {item.name} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
