'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80', '#facc15', '#f87171'];

interface JobsStatusChartProps {
    data: { name: string; value: number }[];
}

export default function JobsStatusChart({ data }: JobsStatusChartProps) {
    if (!data.some((entry) => entry.value > 0)) {
        return <p className="text-sm text-muted-foreground">No jobs to chart yet.</p>;
    }

    return (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8" label>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
