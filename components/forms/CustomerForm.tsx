'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormRow } from '@/components/forms/fields';
import type { Customer } from '@/lib/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(120),
  email: z.string().trim().email('Enter a valid email'),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
});

type Values = z.infer<typeof schema>;

export function CustomerForm({
  customer,
  onDone,
}: {
  customer?: Customer;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      address: customer?.address ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    const res = await fetch(
      customer ? `/api/customers/${customer.id}` : '/api/customers',
      {
        method: customer ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      },
    );
    setSubmitting(false);

    if (!res.ok) {
      toast.error('Could not save the customer.');
      return;
    }

    toast.success(customer ? 'Customer updated' : 'Customer added');
    if (onDone) onDone();
    router.refresh();
    if (!customer) router.push('/customers');
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Full name" {...form.register('name')} />
        </FormRow>
        <FormRow label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" placeholder="name@example.com" {...form.register('email')} />
        </FormRow>
        <FormRow label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" placeholder="080…" {...form.register('phone')} />
        </FormRow>
      </div>
      <FormRow label="Address" htmlFor="address" error={errors.address?.message}>
        <Textarea id="address" rows={2} placeholder="Street, area, city" {...form.register('address')} />
      </FormRow>

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        <Button type="button" variant="outline" onClick={() => (onDone ? onDone() : router.back())} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : customer ? 'Save changes' : 'Add customer'}
        </Button>
      </div>
    </form>
  );
}
