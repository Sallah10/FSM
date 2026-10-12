import { listCustomers, listTechnicians } from '@/lib/db/queries';
import { PageHeader } from '@/components/layout/PageHeader';
import { JobForm } from '@/components/forms/JobForm';
import { Card, CardContent } from '@/components/ui/card';

export default async function NewJobPage() {
  const [customers, technicians] = await Promise.all([
    listCustomers(),
    listTechnicians(),
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
