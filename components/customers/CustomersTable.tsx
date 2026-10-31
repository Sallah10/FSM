import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/layout/EmptyState';
import type { Customer } from '@/lib/types';

export function CustomersTable({
  customers,
  hasQuery = false,
}: {
  customers: (Customer & { jobs?: number })[];
  hasQuery?: boolean;
}) {
  if (customers.length === 0) {
    return (
      <EmptyState
        title="No customers found"
        description={
          hasQuery
            ? 'Try a different search.'
            : 'Add a customer to start logging jobs and invoices.'
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Customer</TableHead>
            <TableHead className="hidden sm:table-cell">Contact</TableHead>
            <TableHead className="hidden md:table-cell">Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="pl-4">
                <Link
                  href={`/customers/${customer.id}`}
                  className="font-medium hover:text-brand"
                >
                  {customer.name}
                </Link>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {customer.email}
                </p>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" /> {customer.email}
                </span>
                {customer.phone ? (
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="size-3.5" /> {customer.phone}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-[240px] truncate text-sm text-muted-foreground">
                {customer.address ?? '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
