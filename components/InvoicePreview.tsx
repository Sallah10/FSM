import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invoice {
    id: string;
    customer: string;
    amount: number;
    status?: string;
    date?: string;
    items?: { name: string; price: number }[];
}

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
    return (
        <Card className="bg-background text-card-foreground">
            <CardHeader>
                <CardTitle>Invoice #{invoice.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p><strong>Customer:</strong> {invoice.customer}</p>
                <p><strong>Amount:</strong> ₦{invoice.amount}</p>
                {invoice.status && <p><strong>Status:</strong> {invoice.status}</p>}
                {invoice.date && <p><strong>Date:</strong> {invoice.date}</p>}

                {invoice.items && (
                    <div className="pt-4">
                        <h4 className="font-semibold mb-1">Items</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                            {invoice.items.map((item, index) => (
                                <li key={index}>
                                    {item.name} - ₦{item.price}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
