'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectGroup } from "@/components/ui/select";

interface JobFormProps {
    onSubmit: (data: unknown) => void;
}

export default function JobForm({ onSubmit }: JobFormProps) {
    const [form, setForm] = useState({ title: '', customer: '', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="title" placeholder="Job title" value={form.title} onChange={handleChange} />
            <Input name="customer" placeholder="Customer name" value={form.customer} onChange={handleChange} />
            {/* <Select><SelectGroup /></Select> */}

            <Textarea name="description" placeholder="Job description" value={form.description} onChange={handleChange} />
            <Button type="submit">Create Job</Button>
        </form>
    );
}
