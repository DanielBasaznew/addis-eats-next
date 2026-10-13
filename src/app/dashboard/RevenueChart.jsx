'use client';

import { useSyncExternalStore } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const formatETB = (value) =>
  new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(value);

export default function RevenueChart({ data }) {
  const isMounted = useMounted();

  if (!isMounted) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center bg-stone-50/60 dark:bg-stone-800/40 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 animate-pulse">
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
          Loading revenue chart...
        </span>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, left: 4, bottom: 6 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e7e5e4"
            className="dark:opacity-15"
          />
          <XAxis
            dataKey="area"
            tick={{ fill: '#78716c', fontSize: 12 }}
            axisLine={{ stroke: '#d6d3d1' }}
            tickLine={false}
          />
          <YAxis
            width={90}
            tickFormatter={formatETB}
            tick={{ fill: '#78716c', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value) => [formatETB(value), 'Revenue']}
            cursor={{ fill: 'rgba(154, 52, 18, 0.08)' }}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e7e5e4',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '0.875rem',
              color: '#1c1917',
              fontWeight: '500',
            }}
          />
          <Bar
            dataKey="revenue"
            fill="#9a3412"
            radius={[6, 6, 0, 0]}
            maxBarSize={56}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
