'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormRow } from '@/components/forms/fields';
import type { Technician } from '@/lib/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(120),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().max(30).optional(),
  role: z.string().trim().max(60).optional(),
});

type Values = z.infer<typeof schema>;

export function TechnicianForm({
  technician,
  onDone,
}: {
  technician?: Technician;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: technician?.name ?? '',
      email: technician?.email ?? '',
      phone: technician?.phone ?? '',
      role: technician?.role ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    const res = await fetch(
      technician ? `/api/technicians/${technician.id}` : '/api/technicians',
      {
        method: technician ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      },
    );
    setSubmitting(false);

    if (!res.ok) {
      toast.error('Could not save the technician.');
      return;
    }

    toast.success(technician ? 'Technician updated' : 'Technician added');
    if (onDone) onDone();
    router.refresh();
    if (!technician) router.push('/technicians');
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Full name" {...form.register('name')} />
        </FormRow>
        <FormRow label="Role" htmlFor="role" error={errors.role?.message}>
          <Input id="role" placeholder="e.g. Electrician" {...form.register('role')} />
        </FormRow>
        <FormRow label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="name@quickset.com" {...form.register('email')} />
        </FormRow>
        <FormRow label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" placeholder="080…" {...form.register('phone')} />
        </FormRow>
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        <Button type="button" variant="outline" onClick={() => (onDone ? onDone() : router.back())} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : technician ? 'Save changes' : 'Add technician'}
        </Button>
      </div>
    </form>
  );
}
