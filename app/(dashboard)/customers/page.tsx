import Link from 'next/link';
import { Plus } from 'lucide-react';
import { pageCustomers } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { TableSearch } from '@/components/table/TableSearch';
import { TablePager } from '@/components/table/TablePager';
import { Button } from '@/components/ui/button';
import {
  PAGE_SIZE,
  parsePage,
  parseSearch,
  toParamRecord,
} from '@/lib/pagination';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = toParamRecord(sp);
  const { orgId } = await requireSession();

  const search = parseSearch(sp.q);
  const { items, total, page } = await pageCustomers(orgId, {
    page: parsePage(sp.page),
    search,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Everyone you do work for."
        actions={
          <Button asChild>
            <Link href="/customers/new">
              <Plus /> New customer
            </Link>
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <TableSearch
          placeholder="Search customers…"
          value={search}
          params={params}
        />
      </div>

      <CustomersTable customers={items} hasQuery={Boolean(search)} />
      <TablePager
        basePath="/customers"
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        params={params}
      />
    </div>
  );
}
