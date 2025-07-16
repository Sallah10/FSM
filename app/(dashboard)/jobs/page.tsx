import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { jobs } from "@/lib/dummyData";
import Link from "next/link";

export default function JobsPage() {
    return (
        <main className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Jobs</h1>
                <Link href="/jobs/new">
                    <Button>Create New Job</Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                    <JobCard
                        key={job.id}
                        id={job.id}
                        title={job.title}
                        customer={job.customer}
                        status={job.status}
                        date={job.date}
                    />
                ))}
            </div>
        </main>
    );
}
