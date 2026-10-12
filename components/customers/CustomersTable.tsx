'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
}: {
  customers: (Customer & { jobs?: number })[];
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.address ?? ''}`
        .toLowerCase()
        .includes(q),
    );
  }, [customers, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative sm:w-64">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search customers…"
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={
            customers.length === 0
              ? 'Add a customer to start logging jobs and invoices.'
              : 'Try a different search.'
          }
        />
      ) : (
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
              {filtered.map((customer) => (
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
      )}
    </div>
  );
}
