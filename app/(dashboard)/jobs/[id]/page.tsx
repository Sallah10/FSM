

// import { Button } from "@/components/ui/button";
import { MarkAsCompleteButton } from "@/components/MarkasCompleted";
import { jobs } from "@/lib/dummyData";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const job = jobs.find(async (job) => job.id === (await params).id);

    if (!job) return notFound();

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="space-y-2 border-b pb-4">
                <h1 className="text-xl font-bold text-primary">{job.title}</h1>
                <p className="text-muted-foreground text-sm">Job ID: {job.id}</p>
            </div>

            <div className="space-y-3 text-base">
                <p><strong>Customer:</strong> {job.customer}</p>
                <p><strong>Status:</strong> <span className={`font-semibold capitalize ${job.status === 'completed' ? 'text-green-600' : 'text-yellow-500'}`}>{job.status}</span></p>
                <p><strong>Date:</strong> {job.date}</p>

                {job.description && (
                    <div>
                        <strong>Description:</strong>
                        <p className="mt-1 text-muted-foreground">{job.description}</p>
                    </div>
                )}
            </div>

            {job.status !== "completed" && (
                <MarkAsCompleteButton id={job.id} />
            )}
        </main>
    );
}