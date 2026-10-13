'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { titleCase } from '@/lib/format';
import type { UserRole } from '@/lib/types';

interface InviteInfo {
  email: string;
  role: UserRole;
  orgName: string | null;
}

export function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid'>(
    'loading',
  );
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setStatus('invalid');
          return;
        }
        const data = await res.json();
        setInfo({
          email: data.invite.email,
          role: data.invite.role,
          orgName: data.organization?.name ?? null,
        });
        setStatus('ready');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch(`/api/invite/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? 'Could not accept the invite.');
      setBusy(false);
      return;
    }

    const result = await signIn('credentials', {
      email: info!.email,
      password,
      redirect: false,
    });

    setBusy(false);
    if (result?.error) {
      router.push('/auth/login');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Checking your invite…
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm font-medium">This invite is no longer valid</p>
        <p className="text-sm text-muted-foreground">
          It may have been revoked or already accepted.
        </p>
        <Button asChild variant="outline">
          <a href="/auth/login">Go to sign in</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <p className="text-sm font-medium">Join {info?.orgName ?? 'your team'}</p>
        <p className="text-xs text-muted-foreground">
          You&apos;ve been invited as a {titleCase(info?.role ?? 'technician')}.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="invite-name">Full name</Label>
        <Input
          id="invite-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          required
          minLength={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="invite-email">Email</Label>
        <Input id="invite-email" value={info?.email ?? ''} readOnly disabled />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="invite-password">Password</Label>
        <PasswordInput
          id="invite-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
          minLength={8}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : null}
        Accept invite
      </Button>
    </form>
  );
}
