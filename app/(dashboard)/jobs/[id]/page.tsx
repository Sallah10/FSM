import { MarkAsCompleteButton } from "@/components/MarkasCompleted";
import { getJob } from "@/lib/db/queries";
import { notFound } from "next/navigation";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const job = getJob(id);

    if (!job) return notFound();

    return (
        <main className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="space-y-2 border-b pb-4">
                <h1 className="text-xl font-bold text-primary">{job.title}</h1>
                <p className="text-muted-foreground text-sm">Job ID: {job.id}</p>
            </div>

            <div className="space-y-3 text-base">
                <p><strong>Customer:</strong> {job.customer}</p>
                <p><strong>Status:</strong> <span className={`font-semibold capitalize ${job.status === 'completed' ? 'text-green-600' : 'text-yellow-500'}`}>{job.status.replace('_', ' ')}</span></p>
                <p><strong>Date:</strong> {job.date}</p>
                {job.technician && <p><strong>Technician:</strong> {job.technician}</p>}

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
