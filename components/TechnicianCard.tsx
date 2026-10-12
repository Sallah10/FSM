'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, User } from 'lucide-react';
import type { Technician } from '@/lib/types';

export default function TechnicianCard({ technician }: { technician: Technician }) {
    return (
        <Card className="p-5 bg-background text-card-foreground hover:shadow-md hover:scale-[1.01] transition-all space-y-3 border">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User size={18} />
                    {technician.name}
                </h3>
                <Badge variant="outline" className="text-xs capitalize px-2 py-1">{technician.role}</Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                    <Mail size={14} />
                    {technician.email}
                </p>
                {technician.phone && (
                    <p className="flex items-center gap-2">
                        <Phone size={14} />
                        {technician.phone}
                    </p>
                )}
            </div>
        </Card>
    );
}
