import { Card } from '@/components/ui/card';

interface Technician {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
}

export default function TechnicianCard({ technician }: { technician: Technician }) {
    return (
        <Card className="p-4 space-y-1 bg-background text-card-foreground">
            <h3 className="font-semibold text-base">{technician.name}</h3>
            <p className="text-sm text-muted-foreground">{technician.email}</p>
            <p className="text-sm text-muted-foreground">{technician.role}</p>
            {technician.phone && (
                <p className="text-sm text-muted-foreground">{technician.phone}</p>
            )}
        </Card>
    );
}
