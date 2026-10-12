'use client';

import { Pencil } from 'lucide-react';
import { EditDialog } from '@/components/layout/EditDialog';
import { JobForm } from '@/components/forms/JobForm';
import { Button } from '@/components/ui/button';
import type { Customer, Job, Technician } from '@/lib/types';

export function EditJobDialog({
  job,
  customers,
  technicians,
}: {
  job: Job;
  customers: Customer[];
  technicians: Technician[];
}) {
  return (
    <EditDialog
      title="Edit job"
      description="Update the details, status or assignment."
      trigger={
        <Button variant="outline">
          <Pencil /> Edit
        </Button>
      }
    >
      {(close) => (
        <JobForm
          job={job}
          customers={customers}
          technicians={technicians}
          onDone={close}
        />
      )}
    </EditDialog>
  );
}
