import { technicians } from '@/lib/dummyData';
import TechnicianCard from '@/components/TechnicianCard';

export default function TechniciansPage() {
    return (
        <main className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Technicians</h1>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {technicians.map((tech) => (
                    <TechnicianCard key={tech.id} technician={tech} />
                ))}
            </div>
        </main>
    );
}
