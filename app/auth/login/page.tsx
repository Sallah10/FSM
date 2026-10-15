'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { FormRow } from '@/components/forms/fields';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const [form, setForm] = useState({ email: '', password: '' });
  const [code, setCode] = useState('');
  const [phase, setPhase] = useState<'credentials' | 'twofa'>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const completeSignIn = async (twoFactorCode?: string) => {
    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      code: twoFactorCode ?? '',
      redirect: false,
    });

    if (result?.error) {
      setError(twoFactorCode ? 'Invalid or expired code.' : 'Invalid email or password.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (phase === 'credentials') {
        // Find out whether this account needs a second factor before signing in.
        const res = await fetch('/api/account/2fa/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json().catch(() => null);

        if (data?.status === 'invalid') {
          setError('Invalid email or password.');
          return;
        }
        if (data?.status === 'need_2fa') {
          setPhase('twofa');
          return;
        }
        await completeSignIn();
        return;
      }

      if (!/^\d{6}$/.test(code)) {
        setError('Enter the 6-digit code from your authenticator app.');
        return;
      }
      await completeSignIn(code);
    } finally {
      setIsLoading(false);
    }
  };

  const backToCredentials = () => {
    setPhase('credentials');
    setCode('');
    setError('');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-12">
      <Link href="/" className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Wrench className="size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">QuickSet</span>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to manage your jobs and invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {justRegistered ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                Account created. You can sign in now.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            {phase === 'credentials' ? (
              <>
                <FormRow label="Email" htmlFor="email">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </FormRow>

                <FormRow label="Password" htmlFor="password">
                  <PasswordInput
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </FormRow>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app for{' '}
                  <span className="font-medium text-foreground">{form.email}</span>.
                </p>
                <FormRow label="Verification code" htmlFor="code">
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    className="tracking-[0.3em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    autoFocus
                  />
                </FormRow>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? 'Signing in…'
                : phase === 'twofa'
                  ? 'Verify and sign in'
                  : 'Sign in'}
            </Button>

            {phase === 'twofa' ? (
              <button
                type="button"
                onClick={backToCredentials}
                className="text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Use a different account
              </button>
            ) : null}

            {googleEnabled && phase === 'credentials' ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                disabled={isLoading}
              >
                Continue with Google
              </Button>
            ) : null}

            {phase === 'credentials' ? (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                Demo - <span className="font-mono">demo@quickset.com</span> /{' '}
                <span className="font-mono">demo123</span>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
