import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mail, MapPin, Phone, Trash2 } from 'lucide-react';
import {
  getCustomer,
  listInvoices,
  listJobs,
} from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { ConfirmDelete } from '@/components/ConfirmDelete';
import { EditCustomerDialog } from '@/components/customers/EditCustomerDialog';
import { InvoiceBadge, StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/layout/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireSession();
  const { id } = await params;
  const customer = await getCustomer(orgId, id);
  if (!customer) notFound();

  const [jobs, invoices] = await Promise.all([
    listJobs(orgId),
    listInvoices(orgId),
  ]);
  const customerJobs = jobs.filter((job) => job.customerId === customer.id);
  const customerInvoices = invoices.filter(
    (invoice) => invoice.customerId === customer.id,
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.name}
        description={customer.address ?? customer.email}
        breadcrumbs={[
          { label: 'Customers', href: '/customers' },
          { label: customer.name },
        ]}
        actions={
          <>
            <EditCustomerDialog customer={customer} />
            <ConfirmDelete
              url={`/api/customers/${customer.id}`}
              title="Delete this customer?"
              description="Jobs linked to this customer will also be removed. This cannot be undone."
              redirectTo="/customers"
            >
              <Button variant="outline" size="icon" aria-label="Delete customer">
                <Trash2 />
              </Button>
            </ConfirmDelete>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> {customer.email}
            </span>
            {customer.phone ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4" /> {customer.phone}
              </span>
            ) : null}
            {customer.address ? (
              <span className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" /> {customer.address}
              </span>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Jobs</CardTitle>
            <Link
              href="/jobs/new"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              New job
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col">
            {customerJobs.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No jobs for this customer yet.
              </p>
            ) : (
              customerJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-4 border-b py-3 last:border-0 hover:bg-accent/40 -mx-6 px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(job.date)}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Invoices</CardTitle>
          <Link
            href="/invoices/new"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            New invoice
          </Link>
        </CardHeader>
        <CardContent>
          {customerInvoices.length === 0 ? (
            <EmptyState title="No invoices yet" />
          ) : (
            <div className="flex flex-col">
              {customerInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between gap-4 border-b py-3 last:border-0 hover:bg-accent/40 -mx-6 px-6"
                >
                  <div>
                    <p className="text-sm font-medium uppercase">{invoice.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(invoice.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <InvoiceBadge status={invoice.status} />
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
