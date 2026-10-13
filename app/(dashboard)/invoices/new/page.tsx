import { listCustomers } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { InvoiceForm } from '@/components/forms/InvoiceForm';
import { Card, CardContent } from '@/components/ui/card';

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { orgId } = await requireSession();
  const [customers, { customerId }] = await Promise.all([
    listCustomers(orgId),
    searchParams,
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="New invoice"
        description="Add line items and send it to the customer."
        breadcrumbs={[{ label: 'Invoices', href: '/invoices' }, { label: 'New' }]}
      />
      <Card>
        <CardContent>
          <InvoiceForm customers={customers} customerId={customerId} />
        </CardContent>
      </Card>
    </div>
  );
}
