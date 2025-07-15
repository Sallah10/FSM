import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
    return (
        <main className="h-screen flex flex-col justify-center items-center text-center px-6">
            <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
                Sorry, we couldn’t find the page you were looking for. It may have been moved or deleted.
            </p>
            <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
            </Link>
        </main>
    );
}
