import { customers } from '@/lib/dummyData';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CustomersPage() {
    return (
        <main className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customers</h1>
                <Link href="/customers/new">
                    <Button>Add Customer</Button>
                </Link>
            </div>

            <div className="space-y-4">
                {customers.map((customer) => (
                    <div
                        key={customer.id}
                        className="flex justify-between items-center p-4 bg-card border rounded-lg"
                    >
                        <div>
                            <p className="font-semibold">{customer.name}</p>
                            <p className="text-muted-foreground text-sm">{customer.email}</p>
                        </div>
                        <Link href={`/customers/${customer.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    );
}
