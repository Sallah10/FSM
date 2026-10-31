import Link from 'next/link';
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
  hasQuery = false,
}: {
  technicians: Technician[];
  jobCounts: Record<string, number>;
  hasQuery?: boolean;
}) {
  if (technicians.length === 0) {
    return (
      <EmptyState
        title="No technicians found"
        description={
          hasQuery
            ? 'Try a different search.'
            : 'Add technicians so you can assign them to jobs.'
        }
      />
    );
  }

  return (
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
          {technicians.map((tech) => (
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
  );
}
