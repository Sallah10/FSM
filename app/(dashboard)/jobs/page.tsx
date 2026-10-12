import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listJobs } from '@/lib/db/queries';
import { PageHeader } from '@/components/layout/PageHeader';
import { JobsTable } from '@/components/jobs/JobsTable';
import { Button } from '@/components/ui/button';

export default async function JobsPage() {
  const jobs = await listJobs();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Jobs"
        description="Every job on the board, with status and assignment."
        actions={
          <Button asChild>
            <Link href="/jobs/new">
              <Plus /> New job
            </Link>
          </Button>
        }
      />
      <JobsTable jobs={jobs} />
    </div>
  );
}
