import { customers } from '@/lib/dummyData';
import { notFound } from 'next/navigation';

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
    const customer = customers.find((c) => c.id === params.id);

    if (!customer) return notFound();

    return (
        <main className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            {customer.address && <p><strong>Address:</strong> {customer.address}</p>}
        </main>
    );
}
