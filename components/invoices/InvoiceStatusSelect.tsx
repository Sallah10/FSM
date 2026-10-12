'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { InvoiceStatus } from '@/lib/types';

const statuses: { value: InvoiceStatus; label: string }[] = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export function InvoiceStatusSelect({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<InvoiceStatus>(status);
  const [pending, startTransition] = useTransition();

  async function onChange(next: InvoiceStatus) {
    const previous = value;
    setValue(next);
    const res = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setValue(previous);
      toast.error('Could not update the invoice.');
      return;
    }
    toast.success('Invoice updated');
    startTransition(() => router.refresh());
  }

  return (
    <Select value={value} onValueChange={(v) => void onChange(v as InvoiceStatus)}>
      <SelectTrigger className="w-[140px]" disabled={pending}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
