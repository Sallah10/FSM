'use client';

import CustomerForm from '@/components/CustomerForm';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
    const router = useRouter();

    const handleSubmit = (data: unknown) => {
        console.log("New customer:", data);
        router.push('/customers');
    };

    return (
        <main className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Add New Customer</h1>
            <CustomerForm onSubmit={handleSubmit} />
        </main>
    );
}
