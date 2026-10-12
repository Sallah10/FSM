import { getInvoice } from '@/lib/db/queries';
import InvoicePreview from '@/components/InvoicePreview';
import { notFound } from 'next/navigation';

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = getInvoice(id);

    if (!invoice) return notFound();

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-primary">Invoice Details</h1>
            <InvoicePreview invoice={invoice} />
        </main>
    );
}
