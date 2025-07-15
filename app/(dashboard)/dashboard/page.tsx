import DashboardStatCard from "@/components/DashboardStatCard";
import { jobs, technicians } from "@/lib/dummyData";
import { Briefcase, Users, DollarSign } from "lucide-react";

export default function DashboardPage() {
    const totalJobs = jobs.length;
    const totalRevenue = 45000; // Example
    const totalTechs = technicians.length;

    return (
        <main className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DashboardStatCard title="Jobs" value={totalJobs.toString()} icon={<Briefcase className="text-blue-500" />} />
                <DashboardStatCard title="Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={<DollarSign className="text-green-500" />} />
                <DashboardStatCard title="Technicians" value={totalTechs.toString()} icon={<Users className="text-purple-500" />} />
            </div>
        </main>
    );
}
