import Link from 'next/link';
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
import type { Job } from '@/lib/types';

export function JobsTable({
  jobs,
  hasQuery = false,
}: {
  jobs: Job[];
  hasQuery?: boolean;
}) {
  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs found"
        description={
          hasQuery
            ? 'Try a different search or filter.'
            : 'Create your first job to start dispatching work.'
        }
      />
    );
  }

  return (
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
          {jobs.map((job) => (
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
  );
}
