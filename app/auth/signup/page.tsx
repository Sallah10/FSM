'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
            // Basic validation
            if (!form.email || !form.password || !form.name) {
                throw new Error("All fields are required");
            }

            if (!form.email.includes("@")) {
                throw new Error("Please enter a valid email");
            }

            if (form.password.length < 6) {
                throw new Error("Password must be at least 6 characters");
            }

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert("Demo signup successful. Please log in.");
            router.push("/auth/login");
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
                    placeholder="Password (min 6 chars)"
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
                    <a href="/auth/login" className="underline">
                        Login
                    </a>
                </p>
            </form>
        </main>
    );
}