'use client';

import Link from 'next/link';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
    id: string;
    title: string;
    customer: string;
    status: string;
    date: string;
}

export default function JobCard({ id, title, customer, status, date }: JobCardProps) {
    const statusColor = status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800";

    return (
        <Link href={`/jobs/${id}`} className="block transition-transform hover:scale-[1.015]">
            <Card className="p-5 bg-background border hover:shadow-lg transition-all space-y-2 rounded-xl">
                <h3 className="font-semibold text-lg text-primary">{title}</h3>
                <p className="text-sm text-muted-foreground">Customer: {customer}</p>

                <div className="flex justify-between items-center text-sm">
                    <Badge className={statusColor}>{status}</Badge>
                    <span className="text-xs text-muted-foreground">{date}</span>
                </div>
            </Card>
        </Link>
    );
}
