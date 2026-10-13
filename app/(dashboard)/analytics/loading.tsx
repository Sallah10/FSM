import { StatCardsSkeleton, ChartsSkeleton } from '@/components/layout/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>
      <StatCardsSkeleton />
      <Skeleton className="h-72 w-full rounded-lg" />
      <ChartsSkeleton />
    </div>
  );
}
