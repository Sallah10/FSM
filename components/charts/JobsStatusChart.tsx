'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80', '#facc15', '#f87171'];

const data = [
    { name: 'Completed', value: 8 },
    { name: 'Pending', value: 3 },
    { name: 'Cancelled', value: 2 },
];

export default function JobsStatusChart() {
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
