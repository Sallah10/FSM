'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Chrome } from 'lucide-react';

const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const justRegistered = searchParams.get('registered') === '1';

    const [form, setForm] = useState({ email: "", password: "" });
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
            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center p-6">
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center">Sign In to QuickSet</h2>

                {justRegistered && (
                    <p className="text-sm text-center text-green-600">
                        Account created. You can sign in now.
                    </p>
                )}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Login"}
                </Button>

                {googleEnabled && (
                    <Button
                        type="button"
                        className="w-full mb-3"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                        disabled={isLoading}
                    >
                        <Chrome className="mr-2" />
                        Sign in with Google
                    </Button>
                )}

                <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground text-center">
                    Demo login - email <span className="font-mono">demo@quickset.com</span>,
                    password <span className="font-mono">demo123</span>
                </div>

                <p className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/signup" className="underline">
                        Sign up
                    </Link>
                </p>
            </form>
        </main>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
