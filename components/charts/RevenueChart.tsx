'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface RevenueChartProps {
    data: { month: string; revenue: number }[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
    if (!data.length) {
        return <p className="text-sm text-muted-foreground">No revenue data yet.</p>;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
