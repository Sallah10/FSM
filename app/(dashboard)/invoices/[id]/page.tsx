import { invoices } from '@/lib/dummyData';
import InvoicePreview from '@/components/InvoicePreview';
import { notFound } from 'next/navigation';

export default async function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const invoice = invoices.find(async (i) => i.id === (await params).id);
    // export default async function CustomerDetailPage({ params, }: { params: Promise<{ id: string }> }) {
    // // const customer = ( await customers).find((c) => c.id === params.id);
    // const customer = customers.find(async (c) => c.id === (await params).id);


    if (!invoice) return notFound();

    return (
        <main className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Invoice Detail</h1>
            <InvoicePreview invoice={invoice} />
        </main>
    );
}
