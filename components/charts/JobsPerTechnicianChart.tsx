'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Aliyu', jobs: 5 },
    { name: 'Chioma', jobs: 3 },
    { name: 'Tunde', jobs: 4 },
];

export default function JobsPerTechnicianChart() {
    return (
        <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="jobs" fill="#0ea5e9" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
