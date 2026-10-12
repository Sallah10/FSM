import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Wrench className="size-5" />
      </span>
      <div>
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The page you were looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
