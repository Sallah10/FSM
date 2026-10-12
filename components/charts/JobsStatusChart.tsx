'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const colors: Record<string, string> = {
  Completed: 'oklch(0.62 0.15 155)',
  Pending: 'oklch(0.72 0.15 75)',
  Cancelled: 'oklch(0.58 0.02 286)',
};

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--popover-foreground)',
};

export default function JobsStatusChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  if (!data.some((entry) => entry.value > 0)) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No jobs yet.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={32}
            stroke="var(--muted-foreground)"
          />
          <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={tooltipStyle} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={72}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={colors[entry.name] ?? 'var(--brand)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
