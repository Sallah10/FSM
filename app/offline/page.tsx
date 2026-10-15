import { WifiOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Offline - QuickSet',
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">You&apos;re offline</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          QuickSet needs a connection to load your jobs and messages. Reconnect
          and try again.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/dashboard">Try again</Link>
      </Button>
    </div>
  );
}
