'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--popover-foreground)',
};

export default function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No revenue recorded yet.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={56}
            stroke="var(--muted-foreground)"
            tickFormatter={(value) => formatCurrency(Number(value))}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value) => formatCurrency(Number(value))}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--brand)"
            strokeWidth={2}
            fill="url(#revenue-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
