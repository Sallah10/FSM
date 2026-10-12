import { cn } from '@/lib/utils';
import type { InvoiceStatus, JobPriority, JobStatus } from '@/lib/types';

const jobStyles: Record<JobStatus, string> = {
  pending:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20',
  in_progress:
    'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-400/20',
  completed:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20',
  cancelled:
    'bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800/60 dark:text-zinc-400 dark:ring-zinc-400/20',
};

const invoiceStyles: Record<InvoiceStatus, string> = {
  paid:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-400/20',
  unpaid:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-400/20',
  overdue:
    'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-400/20',
};

const priorityStyles: Record<JobPriority, string> = {
  low: 'text-zinc-500',
  normal: 'text-zinc-600 dark:text-zinc-400',
  high: 'text-amber-600 dark:text-amber-400',
  urgent: 'text-red-600 dark:text-red-400',
};

const jobLabels: Record<JobStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({
  status,
  className,
}: {
  status: JobStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        jobStyles[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {jobLabels[status]}
    </span>
  );
}

export function InvoiceBadge({
  status,
  className,
}: {
  status: InvoiceStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        invoiceStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: JobPriority }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium capitalize',
        priorityStyles[priority],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {priority}
    </span>
  );
}
