import JobForm from "@/components/JobForm";
import { listCustomers, listTechnicians } from "@/lib/db/queries";

export default function NewJobPage() {
    const customers = listCustomers();
    const technicians = listTechnicians();

    return (
        <main className="p-6 max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Create New Job</h1>
            <JobForm customers={customers} technicians={technicians} />
        </main>
    );
}
