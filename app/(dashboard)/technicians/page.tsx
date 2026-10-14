import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listJobs, listTechnicians } from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { TechniciansTable } from '@/components/technicians/TechniciansTable';
import { Button } from '@/components/ui/button';

export default async function TechniciansPage() {
  const { orgId } = await requireRole('admin');
  const [technicians, jobs] = await Promise.all([
    listTechnicians(orgId),
    listJobs(orgId),
  ]);

  const jobCounts: Record<string, number> = {};
  for (const job of jobs) {
    if (!job.technicianId) continue;
    jobCounts[job.technicianId] = (jobCounts[job.technicianId] ?? 0) + 1;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Technicians"
        description="The field team and the work assigned to them."
        actions={
          <Button asChild>
            <Link href="/technicians/new">
              <Plus /> New technician
            </Link>
          </Button>
        }
      />
      <TechniciansTable technicians={technicians} jobCounts={jobCounts} />
    </div>
  );
}
