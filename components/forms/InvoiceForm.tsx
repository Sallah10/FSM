'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormRow, ControlledSelect } from '@/components/forms/fields';
import { formatCurrency } from '@/lib/format';
import type { Customer } from '@/lib/types';

const schema = z.object({
  customerId: z.string().min(1, 'Choose a customer'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date'),
  status: z.enum(['unpaid', 'paid', 'overdue']),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Item needs a name').max(120),
        price: z.number({ error: 'Enter a price' }).min(0, 'Enter a price'),
      }),
    )
    .min(1),
});

type Values = z.infer<typeof schema>;

export function InvoiceForm({
  customers,
  customerId,
  defaultItems,
}: {
  customers: Customer[];
  customerId?: string;
  defaultItems?: { name: string; price: number }[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: customerId ?? customers[0]?.id ?? '',
      date: new Date().toISOString().slice(0, 10),
      status: 'unpaid',
      items: defaultItems?.length ? defaultItems : [{ name: '', price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const items = form.watch('items');
  const total = items?.reduce((sum, item) => sum + (Number(item?.price) || 0), 0) ?? 0;

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error('Could not create the invoice.');
      return;
    }

    const { invoice } = (await res.json()) as { invoice: { id: string } };
    toast.success('Invoice created');
    router.push(`/invoices/${invoice.id}`);
    router.refresh();
  });

  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <FormRow label="Customer" error={errors.customerId?.message}>
          <ControlledSelect
            control={form.control}
            name="customerId"
            placeholder="Select a customer"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
          />
        </FormRow>
        <FormRow label="Invoice date" htmlFor="date" error={errors.date?.message}>
          <Input id="date" type="date" {...form.register('date')} />
        </FormRow>
        <FormRow label="Status">
          <ControlledSelect
            control={form.control}
            name="status"
            options={[
              { value: 'unpaid', label: 'Unpaid' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </FormRow>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Line items</p>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <Input
                className="flex-1"
                placeholder="Description"
                aria-label={`Item ${index + 1} description`}
                {...form.register(`items.${index}.name`)}
              />
              <Input
                className="w-32"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                aria-label={`Item ${index + 1} price`}
                {...form.register(`items.${index}.price`, { valueAsNumber: true })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                aria-label="Remove line item"
              >
                <Trash2 className="text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
        {errors.items ? (
          <p className="text-xs text-destructive">Add at least one valid line item.</p>
        ) : null}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', price: 0 })}
          >
            <Plus /> Add item
          </Button>
          <p className="text-sm font-medium">
            Total <span className="ml-2 tabular-nums">{formatCurrency(total)}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t pt-5">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create invoice'}
        </Button>
      </div>
    </form>
  );
}
