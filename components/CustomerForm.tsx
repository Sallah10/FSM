'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Customer {
    name: string;
    email: string;
    phone?: string;
    address?: string;
}

export default function CustomerForm({
    onSubmit,
    defaultValues,
}: {
    onSubmit: (data: Customer) => void;
    defaultValues?: Partial<Customer>;
}) {
    const [form, setForm] = useState<Customer>({
        name: defaultValues?.name || '',
        email: defaultValues?.email || '',
        phone: defaultValues?.phone || '',
        address: defaultValues?.address || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className='flex flex-col gap-2'>
                <Label htmlFor="name">Name</Label>
                <Input name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className='flex flex-col gap-2'>
                <Label htmlFor="email">Email</Label>
                <Input name="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className='flex flex-col gap-2'>
                <Label htmlFor="phone">Phone</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} />
            </div >

            <div className='flex flex-col gap-2'>
                <Label htmlFor="address">Address</Label>
                <Input name="address" value={form.address} onChange={handleChange} />
            </div>

            <Button type="submit">Save Customer</Button>
        </form>
    );
}
