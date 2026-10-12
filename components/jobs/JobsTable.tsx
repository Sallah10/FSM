'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PriorityDot, StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/layout/EmptyState';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Job, JobStatus } from '@/lib/types';

const filters: { value: 'all' | JobStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function JobsTable({ jobs }: { jobs: Job[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | JobStatus>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = status === 'all' || job.status === status;
      const matchesQuery =
        !q ||
        `${job.title} ${job.customer} ${job.technician ?? ''}`
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [jobs, query, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
                status === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search jobs…"
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No jobs found"
          description={
            jobs.length === 0
              ? 'Create your first job to start dispatching work.'
              : 'Try a different search or filter.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="hidden md:table-cell">Technician</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="pl-4">
                    <Link href={`/jobs/${job.id}`} className="font-medium hover:text-brand">
                      {job.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{job.customer}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={job.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityDot priority={job.priority} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {job.technician ?? 'Unassigned'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDate(job.date)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
