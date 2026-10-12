'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function MarkAsCompleteButton({ id }: { id: string }) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const completeJob = async () => {
        setError('');
        setIsSaving(true);
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
            });

            if (!res.ok) throw new Error('Could not update job');

            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update job');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={completeJob}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white transition-all"
            >
                <CheckCircle2 size={18} />
                {isSaving ? 'Saving...' : 'Mark as Completed'}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}
