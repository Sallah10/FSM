'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Chrome } from 'lucide-react';


export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false); // ADDED loading state

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true); // ADDED loading state management

        try {
            const result = await signIn("credentials", {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (result?.error) {
                alert("Login failed: " + result.error);
            } else {
                router.push("/dashboard"); // CHANGED to useRouter
            }
        } finally {
            setIsLoading(false); // ADDED cleanup
        }
    };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center p-6">
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center">Sign In to QuickSet</h2>

                <Input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading} // ADDED disabled state
                />
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading} // ADDED disabled state
                />

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading} // ADDED disabled state
                >
                    {isLoading ? "Signing in..." : "Login"}
                </Button>

                <Button
                    type="button"
                    className="w-full mb-3"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    disabled={isLoading} // ADDED disabled state
                >
                    <Chrome className="mr-2" />
                    Sign in with Google
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <a href="/auth/signup" className="underline">
                        Sign up
                    </a>
                </p>
            </form>
        </main>
    );
}