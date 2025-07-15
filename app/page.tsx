import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to QuickSet</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        Simplify job scheduling, manage technicians, and track revenue — all in one intuitive dashboard.
      </p>
      <div className="flex gap-4">
        <Link href="/auth/signup">
          <Button>Get Started</Button>
        </Link>
        <Link href="/auth/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
    </main>
  );
}
