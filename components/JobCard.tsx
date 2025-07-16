'use client';

import Link from 'next/link';
import { Card } from "@/components/ui/card";

interface JobCardProps {
    id: string;
    title: string;
    customer: string;
    status: string;
    date: string;
}

export default function JobCard({ id, title, customer, status, date }: JobCardProps) {
    return (
        <Link href={`/jobs/${id}`} className='cursor-pointer'>
            <Card className="p-4 bg-background hover:shadow-md transition-all space-y-1">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{customer}</p>
                <div className="flex justify-between items-center text-sm">
                    <span>Status: <strong>{status}</strong></span>
                    <span>{date}</span>
                </div>
            </Card>
        </Link>
    );
}
