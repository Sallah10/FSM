import DashboardStatCard from "@/components/DashboardStatCard";
import { getStats } from "@/lib/db/queries";
import { Briefcase, Users, DollarSign, AlertCircle } from "lucide-react";

export default function DashboardPage() {
    const stats = getStats();

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStatCard title="Jobs" value={stats.totalJobs.toString()} icon={<Briefcase className="text-blue-500" />} />
                <DashboardStatCard title="Paid Revenue" value={`₦${stats.paidRevenue.toLocaleString()}`} icon={<DollarSign className="text-green-500" />} />
                <DashboardStatCard title="Outstanding" value={`₦${stats.outstandingRevenue.toLocaleString()}`} icon={<AlertCircle className="text-amber-500" />} />
                <DashboardStatCard title="Technicians" value={stats.totalTechnicians.toString()} icon={<Users className="text-purple-500" />} />
            </div>

            <p className="text-xs text-muted-foreground">
                Numbers are live from the local SQLite database - run <code>npm run db:seed</code> to reset the demo data.
            </p>
        </main>
    );
}
