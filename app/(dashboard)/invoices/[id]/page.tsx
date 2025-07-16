import { invoices } from '@/lib/dummyData';
import InvoicePreview from '@/components/InvoicePreview';
import { notFound } from 'next/navigation';

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
    const invoice = invoices.find((i) => i.id === params.id);

    if (!invoice) return notFound();

    return (
        <main className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Invoice Detail</h1>
            <InvoicePreview invoice={invoice} />
        </main>
    );
}
