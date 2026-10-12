'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormRow } from '@/components/forms/fields';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Signup failed');
      }

      router.push('/auth/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
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
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Start managing field service work in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error ? (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <FormRow label="Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormRow>

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

            <FormRow label="Password" htmlFor="password" hint="At least 8 characters.">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
              />
            </FormRow>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
