import Link from 'next/link';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RedirectCountdown } from '@/components/RedirectCountdown';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" />
      </span>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-brand">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page may have been moved, deleted, or the link might be wrong.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
      <RedirectCountdown to="/dashboard" seconds={10} label="dashboard" />
    </div>
  );
}
