'use client';

import JobForm from "@/components/JobForm";
import { useRouter } from "next/navigation";

export default function NewJobPage() {
    const router = useRouter();

    const handleSubmit = (data: unknown) => {
        console.log("New job data:", data);
        router.push("/jobs");
    };

    return (
        <main className="p-6 max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Create New Job</h1>
            <JobForm onSubmit={handleSubmit} />
        </main>
    );
}
