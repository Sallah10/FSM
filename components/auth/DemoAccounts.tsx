'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const DEMO_PASSWORD = 'demo123';

const accounts = [
  { role: 'Admin', email: 'demo@quickset.com', note: 'Everything, incl. team & billing' },
  { role: 'Dispatcher', email: 'dispatcher@quickset.com', note: 'Jobs, customers, invoices' },
  { role: 'Technician', email: 'technician@quickset.com', note: 'Only their assigned jobs' },
];

export function DemoAccounts({
  onPick,
}: {
  onPick: (email: string, password: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (email: string) => {
    try {
      await navigator.clipboard.writeText(`${email} / ${DEMO_PASSWORD}`);
      setCopied(email);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="rounded-md border bg-muted/40 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Try a demo account - click to fill
      </p>
      <div className="flex flex-col gap-1">
        {accounts.map((account) => (
          <div key={account.email} className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onPick(account.email, DEMO_PASSWORD)}
              className="flex min-w-0 flex-col rounded-sm px-1 py-0.5 text-left hover:bg-accent"
            >
              <span className="text-sm font-medium">{account.role}</span>
              <span className="truncate font-mono text-xs text-muted-foreground">
                {account.email}
              </span>
              <span className="text-[11px] text-muted-foreground">{account.note}</span>
            </button>
            <button
              type="button"
              onClick={() => copy(account.email)}
              aria-label={`Copy ${account.role} login`}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {copied === account.email ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Password <span className="font-mono">{DEMO_PASSWORD}</span> for all. Shared demo data -
        edits are visible to everyone.
      </p>
    </div>
  );
}
