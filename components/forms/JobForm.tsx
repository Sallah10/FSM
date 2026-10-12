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
import { FormRow, ControlledSelect } from '@/components/forms/fields';
import type { Customer, Job, Technician } from '@/lib/types';

const schema = z.object({
  title: z.string().trim().min(3, 'Use at least 3 characters').max(120),
  customerId: z.string().min(1, 'Choose a customer'),
  description: z.string().max(1000).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  technicianId: z.string(),
});

type Values = z.infer<typeof schema>;

const UNASSIGNED = 'unassigned';

export function JobForm({
  customers,
  technicians,
  job,
  onDone,
}: {
  customers: Customer[];
  technicians: Technician[];
  job?: Job;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job?.title ?? '',
      customerId: job?.customerId ?? customers[0]?.id ?? '',
      description: job?.description ?? '',
      status: job?.status ?? 'pending',
      priority: job?.priority ?? 'normal',
      date: job?.date ?? new Date().toISOString().slice(0, 10),
      technicianId: job?.technicianId ?? UNASSIGNED,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    const payload = {
      title: values.title,
      customerId: values.customerId,
      description: values.description?.trim() ? values.description : null,
      status: values.status,
      priority: values.priority,
      date: values.date,
      technicianId: values.technicianId === UNASSIGNED ? null : values.technicianId,
    };

    const res = await fetch(job ? `/api/jobs/${job.id}` : '/api/jobs', {
      method: job ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error('Could not save the job. Please try again.');
      return;
    }

    toast.success(job ? 'Job updated' : 'Job created');
    if (onDone) {
      onDone();
    } else {
      router.push(job ? `/jobs/${job.id}` : '/jobs');
    }
    router.refresh();
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <FormRow label="Title" htmlFor="title" error={errors.title?.message}>
        <Input id="title" placeholder="e.g. Air conditioner repair" {...form.register('title')} />
      </FormRow>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormRow label="Customer" error={errors.customerId?.message}>
          <ControlledSelect
            control={form.control}
            name="customerId"
            placeholder="Select a customer"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </FormRow>

        <FormRow label="Technician" hint="You can assign or change this later.">
          <ControlledSelect
            control={form.control}
            name="technicianId"
            options={[
              { value: UNASSIGNED, label: 'Unassigned' },
              ...technicians.map((t) => ({ value: t.id, label: `${t.name} - ${t.role}` })),
            ]}
          />
        </FormRow>

        <FormRow label="Status">
          <ControlledSelect
            control={form.control}
            name="status"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in_progress', label: 'In progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </FormRow>

        <FormRow label="Priority">
          <ControlledSelect
            control={form.control}
            name="priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
          />
        </FormRow>

        <FormRow label="Scheduled date" htmlFor="date" error={errors.date?.message}>
          <Input id="date" type="date" {...form.register('date')} />
        </FormRow>
      </div>

      <FormRow label="Description" htmlFor="description" error={errors.description?.message}>
        <Textarea
          id="description"
          rows={4}
          placeholder="What needs to be done?"
          {...form.register('description')}
        />
      </FormRow>

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        <Button type="button" variant="outline" onClick={() => (onDone ? onDone() : router.back())} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : job ? 'Save changes' : 'Create job'}
        </Button>
      </div>
    </form>
  );
}
