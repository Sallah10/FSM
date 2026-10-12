'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Customer, JobStatus, Technician } from '@/lib/types';

interface JobFormProps {
    customers: Customer[];
    technicians: Technician[];
}

export default function JobForm({ customers, technicians }: JobFormProps) {
    const router = useRouter();
    const [form, setForm] = useState({
        title: '',
        customerId: customers[0]?.id ?? '',
        technicianId: '',
        status: 'pending' as JobStatus,
        description: '',
    });
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSaving(true);

        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    technicianId: form.technicianId || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? 'Could not create job');
            }

            router.push('/jobs');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create job');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Input name="title" placeholder="Job title" value={form.title} onChange={handleChange} required />

            <div className="flex flex-col gap-2">
                <Label>Customer</Label>
                <Select
                    value={form.customerId}
                    onValueChange={(value) => setForm({ ...form, customerId: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Technician (optional)</Label>
                <Select
                    value={form.technicianId}
                    onValueChange={(value) => setForm({ ...form, technicianId: value })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm">
                        {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                                {tech.name} - {tech.role}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                    value={form.status}
                    onValueChange={(value) => setForm({ ...form, status: value as JobStatus })}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="backdrop-blur-sm">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Textarea name="description" placeholder="Job description" value={form.description} onChange={handleChange} />

            <Button type="submit" disabled={isSaving || customers.length === 0}>
                {isSaving ? 'Creating...' : 'Create Job'}
            </Button>

            {customers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Add a customer first before creating a job.
                </p>
            )}
        </form>
    );
}
