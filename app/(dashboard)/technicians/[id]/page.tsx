import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mail, Phone, Trash2 } from 'lucide-react';
import { getTechnician, listJobs } from '@/lib/db/queries';
import { requireRole } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { EditTechnicianDialog } from '@/components/technicians/EditTechnicianDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

export default async function TechnicianDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireRole('admin');
  const { id } = await params;
  const technician = await getTechnician(orgId, id);
  if (!technician) notFound();

  const jobs = await listJobs(orgId);
  const assigned = jobs.filter((job) => job.technicianId === technician.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={technician.name}
        description={technician.role}
        breadcrumbs={[
          { label: 'Technicians', href: '/technicians' },
          { label: technician.name },
        ]}
        actions={
          <>
            <EditTechnicianDialog technician={technician} />
            <ConfirmDelete
              url={`/api/technicians/${technician.id}`}
              title="Delete this technician?"
              description="Jobs assigned to them will become unassigned. This cannot be undone."
              redirectTo="/technicians"
            >
              <Button variant="outline" size="icon" aria-label="Delete technician">
                <Trash2 />
              </Button>
            </ConfirmDelete>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> {technician.email}
            </span>
            {technician.phone ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> {technician.phone}
              </span>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Assigned jobs ({assigned.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {assigned.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No jobs assigned yet.
              </p>
            ) : (
              assigned.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-4 border-b py-3 last:border-0 hover:bg-accent/40 -mx-6 px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.customer} · {formatDate(job.date)}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
