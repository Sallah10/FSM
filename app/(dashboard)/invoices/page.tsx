import { invoices } from '@/lib/dummyData';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function InvoicesPage() {
    return (
        <main className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Invoices</h1>
            <div className="space-y-4">
                {invoices.map((invoice) => (
                    <div
                        key={invoice.id}
                        className="flex justify-between items-center p-4 bg-card border rounded-lg"
                    >
                        <div>
                            <p className="font-semibold">{invoice.customer}</p>
                            <p className="text-muted-foreground text-sm">₦{invoice.amount}</p>
                        </div>
                        <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    );
}
