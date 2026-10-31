import Link from 'next/link';
import { Plus } from 'lucide-react';
import { pageJobs } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { JobsTable } from '@/components/jobs/JobsTable';
import { FilterTabs } from '@/components/table/FilterTabs';
import { TableSearch } from '@/components/table/TableSearch';
import { TablePager } from '@/components/table/TablePager';
import { Button } from '@/components/ui/button';
import {
  PAGE_SIZE,
  parsePage,
  parseSearch,
  toParamRecord,
} from '@/lib/pagination';
import type { JobStatus } from '@/lib/types';

const jobStatuses: JobStatus[] = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
];

const filters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = toParamRecord(sp);
  const { orgId, role, technicianId } = await requireSession();
  const mine = role === 'technician';

  const search = parseSearch(sp.q);
  const rawStatus = typeof sp.status === 'string' ? sp.status : undefined;
  const status = jobStatuses.includes(rawStatus as JobStatus)
    ? (rawStatus as JobStatus)
    : undefined;

  const { items, total, page } = await pageJobs(orgId, {
    page: parsePage(sp.page),
    search,
    status,
    technicianId: mine ? technicianId ?? undefined : undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={mine ? 'My jobs' : 'Jobs'}
        description={
          mine
            ? 'The jobs assigned to you, with status and schedule.'
            : 'Every job on the board, with status and assignment.'
        }
        actions={
          mine ? undefined : (
            <Button asChild>
              <Link href="/jobs/new">
                <Plus /> New job
              </Link>
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          basePath="/jobs"
          paramKey="status"
          value={status ?? 'all'}
          options={filters}
          params={params}
        />
        <TableSearch placeholder="Search jobs…" value={search} params={params} />
      </div>

      <JobsTable jobs={items} hasQuery={Boolean(search || status)} />
      <TablePager
        basePath="/jobs"
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        params={params}
      />
    </div>
  );
}
