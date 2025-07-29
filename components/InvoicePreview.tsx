import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
        <Card className="bg-background text-card-foreground shadow-md rounded-xl">
            <CardHeader className="space-y-2 border-b">
                <CardTitle className="text-xl font-semibold">
                    Invoice #{invoice.id}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                    {invoice.date && <>Issued on: {invoice.date}</>}
                </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
                <div className="text-base space-y-1">
                    <p><strong>Customer:</strong> {invoice.customer}</p>
                    <p><strong>Amount:</strong> ₦{invoice.amount.toLocaleString()}</p>
                    {invoice.status && (
                        <p className="flex items-center gap-2">
                            <strong>Status:</strong>
                            <Badge
                                className={
                                    invoice.status === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }
                            >
                                {invoice.status}
                            </Badge>
                        </p>
                    )}
                </div>

                {invoice.items && (
                    <div>
                        <h4 className="font-semibold mb-2">Items</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {invoice.items.map((item, index) => (
                                <li key={index}>
                                    {item.name} - ₦{item.price.toLocaleString()}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
