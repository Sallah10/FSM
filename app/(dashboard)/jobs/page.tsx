import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listJobs } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { JobsTable } from '@/components/jobs/JobsTable';
import { Button } from '@/components/ui/button';

export default async function JobsPage() {
  const { orgId, role, technicianId } = await requireSession();
  const mine = role === 'technician';
  const jobs = await listJobs(
    orgId,
    mine && technicianId ? { technicianId } : undefined,
  );

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
      <JobsTable jobs={jobs} />
    </div>
  );
}
