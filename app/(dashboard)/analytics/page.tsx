import { getStats } from '@/lib/db/queries';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import RevenueChart from '@/components/charts/RevenueChart';
import JobsStatusChart from '@/components/charts/JobsStatusChart';
import JobsPerTechnicianChart from '@/components/charts/JobsPerTechnicianChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';

export default async function AnalyticsPage() {
  const stats = await getStats();

  const completionRate =
    stats.totalJobs > 0
      ? Math.round((stats.completedJobs / stats.totalJobs) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="How the business is performing over time."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total jobs" value={stats.totalJobs} />
        <StatCard label="Completion rate" value={`${completionRate}%`} />
        <StatCard label="Collected" value={formatCurrency(stats.paidRevenue)} />
        <StatCard
          label="Outstanding"
          value={formatCurrency(stats.outstandingRevenue)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Revenue by month</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={stats.revenueByMonth} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs by status</CardTitle>
          </CardHeader>
          <CardContent>
            <JobsStatusChart data={stats.jobsByStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs per technician</CardTitle>
          </CardHeader>
          <CardContent>
            <JobsPerTechnicianChart data={stats.jobsPerTechnician} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
