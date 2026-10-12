'use client';

import { useState } from 'react';
import CustomerForm from '@/components/CustomerForm';
import { useRouter } from 'next/navigation';

export default function NewCustomerPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (data: unknown) => {
        setError('');
        const res = await fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error ?? 'Could not save customer');
            return;
        }

        router.push('/customers');
        router.refresh();
    };

    return (
        <main className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Add New Customer</h1>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <CustomerForm onSubmit={handleSubmit} />
        </main>
    );
}
