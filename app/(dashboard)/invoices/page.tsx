import Link from 'next/link';
import { Plus } from 'lucide-react';
import { pageInvoices } from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
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
import type { InvoiceStatus } from '@/lib/types';

const invoiceStatuses: InvoiceStatus[] = ['unpaid', 'paid', 'overdue'];

const filters = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = toParamRecord(sp);
  const { orgId } = await requireRole('admin', 'dispatcher');

  const search = parseSearch(sp.q);
  const rawStatus = typeof sp.status === 'string' ? sp.status : undefined;
  const status = invoiceStatuses.includes(rawStatus as InvoiceStatus)
    ? (rawStatus as InvoiceStatus)
    : undefined;

  const { items, total, page } = await pageInvoices(orgId, {
    page: parsePage(sp.page),
    search,
    status,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Billing, payments and what's still outstanding."
        actions={
          <Button asChild>
            <Link href="/invoices/new">
              <Plus /> New invoice
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterTabs
          basePath="/invoices"
          paramKey="status"
          value={status ?? 'all'}
          options={filters}
          params={params}
        />
        <TableSearch
          placeholder="Search invoices…"
          value={search}
          params={params}
        />
      </div>

      <InvoicesTable invoices={items} hasQuery={Boolean(search || status)} />
      <TablePager
        basePath="/invoices"
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        params={params}
      />
    </div>
  );
}
