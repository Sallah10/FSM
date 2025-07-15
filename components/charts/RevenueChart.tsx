'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
    { month: 'Jan', revenue: 3000 },
    { month: 'Feb', revenue: 4000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 3200 },
];

export default function RevenueChart() {
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
