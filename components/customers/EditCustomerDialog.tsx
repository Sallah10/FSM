'use client';

import { Pencil } from 'lucide-react';
import { EditDialog } from '@/components/layout/EditDialog';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { Button } from '@/components/ui/button';
import type { Customer } from '@/lib/types';

export function EditCustomerDialog({ customer }: { customer: Customer }) {
  return (
    <EditDialog
      title="Edit customer"
      trigger={
        <Button variant="outline">
          <Pencil /> Edit
        </Button>
      }
    >
      {(close) => <CustomerForm customer={customer} onDone={close} />}
    </EditDialog>
  );
}
