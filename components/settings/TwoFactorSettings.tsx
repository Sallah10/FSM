'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Copy, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SetupData {
  secret: string;
  otpauthUrl: string;
}

// Groups a base32 secret as "ABCD EFGH IJKL ..." so it is easier to type by hand.
function groupSecret(secret: string) {
  return secret.replace(/(.{4})/g, '$1 ').trim();
}

export function TwoFactorSettings() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/account/2fa');
    if (res.ok) {
      const data = await res.json();
      setEnabled(Boolean(data.enabled));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(action: 'begin' | 'enable' | 'disable', body: object = {}) {
    setBusy(true);
    setError(null);
    const res = await fetch('/api/account/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
    });
    const data = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      setError(data?.error ?? 'Something went wrong.');
      return null;
    }
    return data;
  }

  async function beginSetup() {
    const data = await post('begin');
    if (data) {
      setSetup({ secret: data.secret, otpauthUrl: data.otpauthUrl });
      setCode('');
    }
  }

  async function confirmEnable() {
    const data = await post('enable', { code });
    if (data) {
      setEnabled(true);
      setSetup(null);
      setCode('');
    }
  }

  async function confirmDisable() {
    const data = await post('disable', { code });
    if (data) {
      setEnabled(false);
      setCode('');
    }
  }

  function cancelSetup() {
    setSetup(null);
    setCode('');
    setError(null);
  }

  async function copySecret() {
    if (!setup) return;
    try {
      await navigator.clipboard.writeText(setup.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Copy failed - select the key and copy it manually.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Checking your 2FA status…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Two-factor authentication</p>
          <p className="text-xs text-muted-foreground">
            {enabled
              ? 'On — you enter a code from your authenticator app when signing in.'
              : 'Add a one-time code from an authenticator app on top of your password.'}
          </p>
        </div>
        <span
          className={
            enabled
              ? 'inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400'
              : 'inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground'
          }
        >
          {enabled ? (
            <>
              <ShieldCheck className="size-3.5" /> On
            </>
          ) : (
            <>
              <ShieldOff className="size-3.5" /> Off
            </>
          )}
        </span>
      </div>

      {!enabled && !setup ? (
        <div>
          <Button variant="outline" onClick={beginSetup} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            Set up two-factor authentication
          </Button>
        </div>
      ) : null}

      {setup ? (
        <div className="flex flex-col gap-5 rounded-md border p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="w-fit rounded-md border bg-white p-2">
              <QRCodeSVG value={setup.otpauthUrl} size={168} level="M" marginSize={2} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm font-medium">Scan the QR code</p>
              <p className="text-xs text-muted-foreground">
                Open Google Authenticator, Authy or 1Password and scan this. Can&apos;t
                scan? Enter this key manually:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs">
                  {groupSecret(setup.secret)}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy setup key"
                  onClick={copySecret}
                >
                  {copied ? <Check /> : <Copy />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="totp-code">Enter the 6-digit code to confirm</Label>
            <div className="flex items-center gap-2">
              <Input
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                className="w-40 tracking-[0.3em]"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                disabled={busy}
              />
              <Button
                onClick={confirmEnable}
                disabled={busy || code.length !== 6}
              >
                {busy ? <Loader2 className="animate-spin" /> : null}
                Verify and enable
              </Button>
              <Button variant="ghost" onClick={cancelSetup} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {enabled ? (
        <div className="flex flex-col gap-3 rounded-md border p-4">
          <p className="text-sm font-medium">Turn off two-factor authentication</p>
          <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              className="w-40 tracking-[0.3em]"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
              disabled={busy}
            />
            <Button
              variant="outline"
              onClick={confirmDisable}
              disabled={busy || code.length !== 6}
            >
              {busy ? <Loader2 className="animate-spin" /> : null}
              Turn off
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
