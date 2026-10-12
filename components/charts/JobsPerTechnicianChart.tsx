'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface JobsPerTechnicianChartProps {
    data: { name: string; jobs: number }[];
}

export default function JobsPerTechnicianChart({ data }: JobsPerTechnicianChartProps) {
    if (!data.length) {
        return <p className="text-sm text-muted-foreground">No technician assignments yet.</p>;
    }

    return (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#0ea5e9" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
