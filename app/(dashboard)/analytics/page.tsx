import RevenueChart from "@/components/charts/RevenueChart";
import JobsStatusChart from "@/components/charts/JobsStatusChart";
import JobsPerTechnicianChart from "@/components/charts/JobsPerTechnicianChart";

export default function AnalyticsPage() {
    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Analytics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="col-span-1">
                    <h2 className="text-lg font-semibold mb-2">Revenue Overview</h2>
                    <RevenueChart />
                </div>
                <div className="col-span-1">
                    <h2 className="text-lg font-semibold mb-2">Jobs Status</h2>
                    <JobsStatusChart />
                </div>
                <div className="col-span-1">
                    <h2 className="text-lg font-semibold mb-2">Jobs per Technician</h2>
                    <JobsPerTechnicianChart />
                </div>
            </div>
        </main>
    );
}
