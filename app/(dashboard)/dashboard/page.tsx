import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Plus,
  Wallet,
  Wrench,
} from 'lucide-react';
import { getStats, listInvoices, listJobs } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import JobsStatusChart from '@/components/charts/JobsStatusChart';
import { InvoiceBadge, StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format';

export default async function DashboardPage() {
  const { orgId } = await requireSession();

  const [stats, jobs, invoices] = await Promise.all([
    getStats(orgId),
    listJobs(orgId),
    listInvoices(orgId),
  ]);

  const recent = jobs.slice(0, 6);
  const overdue = invoices.filter((invoice) => invoice.status === 'overdue').slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="A clear view of the work on your board right now."
        actions={
          <Button asChild>
            <Link href="/jobs/new">
              <Plus /> New job
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open jobs"
          value={stats.pendingJobs}
          hint={`${stats.totalJobs} total on the board`}
          icon={Briefcase}
        />
        <StatCard
          label="Completed"
          value={stats.completedJobs}
          hint="All time"
          icon={CheckCircle2}
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.outstandingRevenue)}
          hint={`${formatCurrency(stats.paidRevenue)} collected`}
          icon={Wallet}
        />
        <StatCard
          label="Technicians"
          value={stats.totalTechnicians}
          hint={`${stats.totalCustomers} customers`}
          icon={Wrench}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue</CardTitle>
            <p className="text-sm text-muted-foreground">Invoiced by month</p>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.revenueByMonth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs by status</CardTitle>
            <p className="text-sm text-muted-foreground">Across all time</p>
          </CardHeader>
          <CardContent>
            <JobsStatusChart data={stats.jobsByStatus} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent jobs</CardTitle>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View all <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col">
            {recent.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No jobs yet.
              </p>
            ) : (
              recent.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between gap-4 border-b py-3 last:border-0 hover:bg-accent/40 -mx-6 px-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {job.customer} · {formatDate(job.date)}
                    </p>
                  </div>
                  <StatusBadge status={job.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Needs follow-up</CardTitle>
            <Link
              href="/invoices"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Invoices <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {overdue.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing overdue. Nice.
              </p>
            ) : (
              overdue.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{invoice.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(invoice.amount)}
                    </p>
                  </div>
                  <InvoiceBadge status={invoice.status} />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
