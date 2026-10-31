import Link from 'next/link';
import { Plus } from 'lucide-react';
import { jobCountsForTechnicians, pageTechnicians } from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { TechniciansTable } from '@/components/technicians/TechniciansTable';
import { TableSearch } from '@/components/table/TableSearch';
import { TablePager } from '@/components/table/TablePager';
import { Button } from '@/components/ui/button';
import {
  PAGE_SIZE,
  parsePage,
  parseSearch,
  toParamRecord,
} from '@/lib/pagination';

export default async function TechniciansPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = toParamRecord(sp);
  const { orgId } = await requireRole('admin');

  const search = parseSearch(sp.q);
  const { items, total, page } = await pageTechnicians(orgId, {
    page: parsePage(sp.page),
    search,
  });

  const jobCounts = await jobCountsForTechnicians(
    orgId,
    items.map((technician) => technician.id),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Technicians"
        description="The field team and the work assigned to them."
        actions={
          <Button asChild>
            <Link href="/technicians/new">
              <Plus /> New technician
            </Link>
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <TableSearch
          placeholder="Search technicians…"
          value={search}
          params={params}
        />
      </div>

      <TechniciansTable
        technicians={items}
        jobCounts={jobCounts}
        hasQuery={Boolean(search)}
      />
      <TablePager
        basePath="/technicians"
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        params={params}
      />
    </div>
  );
}
