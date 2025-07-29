import { invoices } from '@/lib/dummyData';
import InvoicePreview from '@/components/InvoicePreview';
import { notFound } from 'next/navigation';

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // const invoice = invoices.find(async (i) => i.id === (await params).id);
    const { id } = await params;
    const invoice = invoices.find((i) => i.id === id);


    if (!invoice) return notFound();

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-primary">Invoice Details</h1>
            <InvoicePreview invoice={invoice} />
        </main>
    );
}
