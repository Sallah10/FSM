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
import { InvoiceBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/layout/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Invoice, InvoiceStatus } from '@/lib/types';

const filters: { value: 'all' | InvoiceStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | InvoiceStatus>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((invoice) => {
      const matchesStatus = status === 'all' || invoice.status === status;
      const matchesQuery =
        !q || `${invoice.id} ${invoice.customer}`.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [invoices, query, status]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={
                'rounded-md px-2.5 py-1 text-sm font-medium transition-colors ' +
                (status === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground')
              }
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
            placeholder="Search invoices…"
            className="pl-8"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description={
            invoices.length === 0
              ? 'Create an invoice once a job is done.'
              : 'Try a different search or filter.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="pr-4 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="pl-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="font-medium uppercase hover:text-brand"
                    >
                      {invoice.id}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{invoice.customer}</TableCell>
                  <TableCell>
                    <InvoiceBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {formatDate(invoice.date)}
                  </TableCell>
                  <TableCell className="pr-4 text-right font-medium tabular-nums">
                    {formatCurrency(invoice.amount)}
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
