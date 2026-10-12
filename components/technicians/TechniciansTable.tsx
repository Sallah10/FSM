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
import { EmptyState } from '@/components/layout/EmptyState';
import type { Technician } from '@/lib/types';

export function TechniciansTable({
  technicians,
  jobCounts,
}: {
  technicians: Technician[];
  jobCounts: Record<string, number>;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return technicians;
    return technicians.filter((tech) =>
      `${tech.name} ${tech.role} ${tech.email}`.toLowerCase().includes(q),
    );
  }, [technicians, query]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative sm:w-64">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search technicians…"
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No technicians found"
          description={
            technicians.length === 0
              ? 'Add technicians so you can assign them to jobs.'
              : 'Try a different search.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Technician</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead className="text-right pr-4">Open jobs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell className="pl-4">
                    <Link
                      href={`/technicians/${tech.id}`}
                      className="font-medium hover:text-brand"
                    >
                      {tech.name}
                    </Link>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {tech.email}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tech.role}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {tech.phone ?? tech.email}
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums text-sm">
                    {jobCounts[tech.id] ?? 0}
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
