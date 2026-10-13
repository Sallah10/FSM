import { listCustomers, listTechnicians } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { JobForm } from '@/components/forms/JobForm';
import { Card, CardContent } from '@/components/ui/card';

export default async function NewJobPage() {
  const { orgId } = await requireSession();
  const [customers, technicians] = await Promise.all([
    listCustomers(orgId),
    listTechnicians(orgId),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="New job"
        description="Log a new job and assign it to a technician."
        breadcrumbs={[{ label: 'Jobs', href: '/jobs' }, { label: 'New' }]}
      />
      <Card>
        <CardContent>
          <JobForm customers={customers} technicians={technicians} />
        </CardContent>
      </Card>
    </div>
  );
}
