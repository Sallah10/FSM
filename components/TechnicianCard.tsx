'use client';

import { Card } from "@/components/ui/card";

interface TechnicianCardProps {
    name: string;
    role: string;
    phone: string;
}

export default function TechnicianCard({ name, role, phone }: TechnicianCardProps) {
    return (
        <Card className="p-4 space-y-1 shadow-sm">
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{role}</p>
            <p className="text-sm">{phone}</p>
        </Card>
    );
}
