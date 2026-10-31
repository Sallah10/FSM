import Link from 'next/link';
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
import type { Invoice } from '@/lib/types';

export function InvoicesTable({
  invoices,
  hasQuery = false,
}: {
  invoices: Invoice[];
  hasQuery?: boolean;
}) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices found"
        description={
          hasQuery
            ? 'Try a different search or filter.'
            : 'Create an invoice once a job is done.'
        }
      />
    );
  }

  return (
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
          {invoices.map((invoice) => (
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
  );
}
