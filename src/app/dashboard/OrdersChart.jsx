'use client';

import { useSyncExternalStore } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
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

export default function OrdersChart({ data }) {
  const isMounted = useMounted();

  if (!isMounted) {
    return (
      <div className="h-[320px] w-full flex items-center justify-center bg-stone-50/60 dark:bg-stone-800/40 rounded-xl border border-dashed border-stone-200 dark:border-stone-800 animate-pulse">
        <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
          Loading orders chart...
        </span>
      </div>
    );
  }

  return (
    <div className="h-[320px] w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            dataKey="date"
            tick={{ fill: '#78716c', fontSize: 12 }}
            axisLine={{ stroke: '#d6d3d1' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#78716c', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value) => [`${value} orders`, 'Volume']}
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
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#9a3412"
            strokeWidth={3}
            dot={{ fill: '#9a3412', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
            activeDot={{ r: 6, fill: '#78350f', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
