import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listInvoices } from '@/lib/db/queries';
import { PageHeader } from '@/components/layout/PageHeader';
import { InvoicesTable } from '@/components/invoices/InvoicesTable';
import { Button } from '@/components/ui/button';

export default async function InvoicesPage() {
  const invoices = await listInvoices();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Invoices"
        description="Billing, payments and what's still outstanding."
        actions={
          <Button asChild>
            <Link href="/invoices/new">
              <Plus /> New invoice
            </Link>
          </Button>
        }
      />
      <InvoicesTable invoices={invoices} />
    </div>
  );
}
