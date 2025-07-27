import { Button } from "@/components/ui/button";
import { jobs } from "@/lib/dummyData";
import { notFound } from "next/navigation";

// type SearchParams = { [key: string]: string | string[] | undefined };

// export interface PageProps {
//     params: { id: string };
//     searchParams: SearchParams;
// }

export default async function JobDetailsPage({ params, }: { params: Promise<{ id: string }> }) {
    const job = jobs.find(async (job) => job.id === (await params).id);
    // export default async function CustomerDetailPage({ params, }: { params: Promise<{ id: string }> }) {
    // // const customer = ( await customers).find((c) => c.id === params.id);
    // const customer = customers.find(async (c) => c.id === (await params).id);


    if (!job) return notFound();

    function completeJob(id: string) {
        console.log(id)
    }

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
            {job.status !== "completed" && (
                <Button onClick={() => completeJob(job.id)}>Mark as Completed</Button>
            )}

        </main>
    );
}
