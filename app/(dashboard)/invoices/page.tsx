import { invoices } from '@/lib/dummyData';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function InvoicesPage() {
    return (
        <main className="p-6 max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-primary">Invoices</h1>

            <div className="space-y-4">
                {invoices.map((invoice) => (
                    <div
                        key={invoice.id}
                        className="flex justify-between items-center p-4 border rounded-xl shadow-sm hover:shadow-md transition-all bg-background"
                    >
                        <div>
                            <h3 className="text-lg font-semibold">{invoice.customer}</h3>
                            <p className="text-muted-foreground text-sm">
                                ₦{invoice.amount.toLocaleString()}  • {invoice.date}
                            </p>
                            {invoice.status && (
                                <Badge
                                    className={`mt-1 ${invoice.status === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {invoice.status}
                                </Badge>
                            )}
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
