'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login data:", form);
        router.push("/dashboard");
    };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center p-6">
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                <Input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
                <Button type="submit" className="w-full">Login</Button>
                <p className="text-sm text-center text-muted-foreground">
                    Don’t have an account? <a href="/auth/signup" className="underline">Sign up</a>
                </p>
            </form>
        </main>
    );
}
