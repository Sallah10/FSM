'use client';

import { Card } from "@/components/ui/card";

interface InvoicePreviewProps {
    id: string;
    customer: string;
    amount: number;
    status: 'paid' | 'unpaid';
    dueDate: string;
}

export default function InvoicePreview({ id, customer, amount, status, dueDate }: InvoicePreviewProps) {
    return (
        <Card className="p-4 space-y-1 shadow-sm">
            <h3 className="text-lg font-semibold">Invoice #{id}</h3>
            <p className="text-sm">Customer: {customer}</p>
            <p className="text-sm">Amount: ₦{amount.toLocaleString()}</p>
            <p className="text-sm">Due: {dueDate}</p>
            <p className={`text-sm font-medium ${status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {status}
            </p>
        </Card>
    );
}
