import { PageHeader } from '@/components/layout/PageHeader';
import { TechnicianForm } from '@/components/forms/TechnicianForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewTechnicianPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="New technician"
        description="Add a member of the field team."
        breadcrumbs={[
          { label: 'Technicians', href: '/technicians' },
          { label: 'New' },
        ]}
      />
      <Card>
        <CardContent>
          <TechnicianForm />
        </CardContent>
      </Card>
    </div>
  );
}
