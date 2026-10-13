import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import {
  getJob,
  listCustomers,
  listJobEvents,
  listTechnicians,
} from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { EditJobDialog } from '@/components/jobs/EditJobDialog';
import { JobStatusSelect } from '@/components/jobs/JobStatusSelect';
import { PriorityDot } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/format';

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireSession();
  const { id } = await params;
  const job = await getJob(orgId, id);
  if (!job) notFound();

  const [events, technicians, customers] = await Promise.all([
    listJobEvents(orgId, id),
    listTechnicians(orgId),
    listCustomers(orgId),
  ]);

  const details: { label: string; value: React.ReactNode }[] = [
    {
      label: 'Customer',
      value: job.customerId ? (
        <Link href={`/customers/${job.customerId}`} className="hover:text-brand">
          {job.customer}
        </Link>
      ) : (
        job.customer
      ),
    },
    { label: 'Technician', value: job.technician ?? 'Unassigned' },
    { label: 'Priority', value: <PriorityDot priority={job.priority} /> },
    { label: 'Scheduled', value: formatDate(job.date) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={job.title}
        description={job.customer}
        breadcrumbs={[{ label: 'Jobs', href: '/jobs' }, { label: job.title }]}
        actions={
          <>
            <EditJobDialog
              job={job}
              customers={customers}
              technicians={technicians}
            />
            <ConfirmDelete
              url={`/api/jobs/${job.id}`}
              title="Delete this job?"
              description="This removes the job and its activity history. This cannot be undone."
              redirectTo="/jobs"
            >
              <Button variant="outline" size="icon" aria-label="Delete job">
                <Trash2 />
              </Button>
            </ConfirmDelete>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {details.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{row.value}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Description
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {job.description?.trim() || 'No description provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <ol className="flex flex-col gap-4">
                  {events.map((event) => (
                    <li key={event.id} className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                      <div>
                        <p className="text-sm">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <JobStatusSelect jobId={job.id} status={job.status} />
              <p className="text-xs text-muted-foreground">
                Changing the status is logged on the activity trail.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reference</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Job ID</span>
                <span className="font-mono text-xs">{job.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Scheduled</span>
                <span>{formatDate(job.date)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
