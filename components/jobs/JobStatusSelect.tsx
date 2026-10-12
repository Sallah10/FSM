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
import type { JobStatus } from '@/lib/types';

const statuses: { value: JobStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function JobStatusSelect({
  jobId,
  status,
}: {
  jobId: string;
  status: JobStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState<JobStatus>(status);
  const [pending, startTransition] = useTransition();

  async function onChange(next: JobStatus) {
    const previous = value;
    setValue(next);
    const res = await fetch(`/api/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      setValue(previous);
      toast.error('Could not update the status.');
      return;
    }
    toast.success('Status updated');
    startTransition(() => router.refresh());
  }

  return (
    <Select value={value} onValueChange={(v) => void onChange(v as JobStatus)}>
      <SelectTrigger className="w-[150px]" disabled={pending}>
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
