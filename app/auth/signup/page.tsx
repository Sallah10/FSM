'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "", name: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.error ?? "Signup failed");
            }

            router.push("/auth/login?registered=1");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center p-6">
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center">Create Account</h2>

                {error && (
                    <p className="text-red-500 text-sm text-center">{error}</p>
                )}

                <Input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                <Input
                    name="email"
                    placeholder="Email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                <Input
                    name="password"
                    type="password"
                    placeholder="Password (min 8 chars)"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating account..." : "Sign Up"}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="underline">
                        Login
                    </Link>
                </p>
            </form>
        </main>
    );
}
