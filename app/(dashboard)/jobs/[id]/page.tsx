import { jobs } from "@/lib/dummyData";
import { notFound } from "next/navigation";

interface JobDetailsPageProps {
    params: { id: string };
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
    const job = jobs.find((job) => job.id === params.id);

    if (!job) return notFound();

    return (
        <main className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p><strong>Customer:</strong> {job.customer}</p>
            <p><strong>Status:</strong> {job.status}</p>
            <p><strong>Date:</strong> {job.date}</p>
            {job.description && (
                <div>
                    <strong>Description:</strong>
                    <p className="mt-1">{job.description}</p>
                </div>
            )}
        </main>
    );
}
