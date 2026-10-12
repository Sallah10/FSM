import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/db/queries";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = getCustomer(id);

    if (!customer) return notFound();

    return (
        <main className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p>
                <strong>Email:</strong> {customer.email}
            </p>
            <p>
                <strong>Phone:</strong> {customer.phone}
            </p>
            {customer.address && (
                <p>
                    <strong>Address:</strong> {customer.address}
                </p>
            )}
        </main>
    );
}
