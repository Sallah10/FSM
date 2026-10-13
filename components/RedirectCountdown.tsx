'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function RedirectCountdown({
  to = '/dashboard',
  seconds = 10,
  label = 'dashboard',
}: {
  to?: string;
  seconds?: number;
  label?: string;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      router.push(to);
      return;
    }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, router, to]);

  return (
    <p className="text-sm text-muted-foreground">
      Taking you to the {label} in{' '}
      <span className="font-medium tabular-nums text-foreground">{remaining}</span>
      s.{' '}
      <Link href={to} className="font-medium text-foreground hover:underline">
        Go now
      </Link>
    </p>
  );
}
