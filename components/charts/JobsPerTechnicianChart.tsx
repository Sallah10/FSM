'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 12,
  color: 'var(--popover-foreground)',
};

export default function JobsPerTechnicianChart({
  data,
}: {
  data: { name: string; jobs: number }[];
}) {
  if (!data.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        No assigned jobs yet.
      </div>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" allowDecimals={false} hide />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
            width={120}
            fontSize={12}
            stroke="var(--muted-foreground)"
          />
          <Tooltip cursor={{ fill: 'var(--accent)' }} contentStyle={tooltipStyle} />
          <Bar dataKey="jobs" fill="var(--brand)" radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
