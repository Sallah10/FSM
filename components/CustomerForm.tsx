'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomerFormProps {
    onSubmit: (data: unknown) => void;
}

export default function CustomerForm({ onSubmit }: CustomerFormProps) {
    const [form, setForm] = useState({ name: '', email: '', phone: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Customer name" value={form.name} onChange={handleChange} />
            <Input name="email" placeholder="Email address" value={form.email} onChange={handleChange} />
            <Input name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
            <Button type="submit">Add Customer</Button>
        </form>
    );
}
