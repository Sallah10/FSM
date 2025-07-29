'use client';

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function MarkAsCompleteButton({ id }: { id: string }) {
    const completeJob = () => {
        console.log("Marking job complete:", id);
        // Later: you can mutate state or fire API here
    };

    return (
        <Button
            onClick={completeJob}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-all"
        >
            <CheckCircle2 size={18} />
            Mark as Completed
        </Button>
    );
}
