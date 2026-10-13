import Link from 'next/link';
import { Plus } from 'lucide-react';
import { listCustomers } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { Button } from '@/components/ui/button';

export default async function CustomersPage() {
  const { orgId } = await requireSession();
  const customers = await listCustomers(orgId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description="Everyone you do work for."
        actions={
          <Button asChild>
            <Link href="/customers/new">
              <Plus /> New customer
            </Link>
          </Button>
        }
      />
      <CustomersTable customers={customers} />
    </div>
  );
}
