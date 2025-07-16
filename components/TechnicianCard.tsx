import { Card } from '@/components/ui/card';

interface Technician {
    id: string;
    name: string;
    email: string;
    phone?: string;
}

export default function TechnicianCard({ technician }: { technician: Technician }) {
    return (
        <Card className="p-4 space-y-1 bg-card text-card-foreground">
            <h3 className="font-semibold text-base">{technician.name}</h3>
            <p className="text-sm text-muted-foreground">{technician.email}</p>
            {technician.phone && (
                <p className="text-sm text-muted-foreground">{technician.phone}</p>
            )}
        </Card>
    );
}
