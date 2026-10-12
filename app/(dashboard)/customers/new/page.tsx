import { PageHeader } from '@/components/layout/PageHeader';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { Card, CardContent } from '@/components/ui/card';

export default function NewCustomerPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        title="New customer"
        description="Add a customer so you can log jobs and invoices for them."
        breadcrumbs={[{ label: 'Customers', href: '/customers' }, { label: 'New' }]}
      />
      <Card>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
