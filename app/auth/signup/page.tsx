'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "", name: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Signup data:", form);
        router.push("/dashboard"); // Fake login
    };

    //       const handleSignup = async () => {
    //     // 👇 Ideally, you'd post this to your backend to create user
    //     const res = await fetch("/api/signup", {
    //       method: "POST",
    //       body: JSON.stringify(form),
    //       headers: { "Content-Type": "application/json" },
    //     });

    //     if (res.ok) router.push("/auth/login");
    //     else alert("Signup failed");
    //   };

    return (
        <main className="min-h-screen flex flex-col justify-center items-center p-6">
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
                <h2 className="text-2xl font-bold text-center">Create Account</h2>
                <Input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                />
                <Input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange} />
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange} />
                <Button type="submit" className="w-full">Sign Up</Button>
                <p className="text-sm text-center text-muted-foreground">
                    Already have an account? <a href="/auth/login" className="underline">Login</a>
                </p>
            </form>
        </main>
    );
}
