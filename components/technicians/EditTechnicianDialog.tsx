'use client';

import { Pencil } from 'lucide-react';
import { EditDialog } from '@/components/layout/EditDialog';
import { TechnicianForm } from '@/components/forms/TechnicianForm';
import { Button } from '@/components/ui/button';
import type { Technician } from '@/lib/types';

export function EditTechnicianDialog({
  technician,
}: {
  technician: Technician;
}) {
  return (
    <EditDialog
      title="Edit technician"
      trigger={
        <Button variant="outline">
          <Pencil /> Edit
        </Button>
      }
    >
      {(close) => <TechnicianForm technician={technician} onDone={close} />}
    </EditDialog>
  );
}
