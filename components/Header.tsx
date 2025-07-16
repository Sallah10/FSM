'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
    return (
        <header className="flex justify-between items-center p-4 border-b shadow-sm">
            <Link href="/dashboard" className="text-xl font-bold">
                QuickSet
            </Link>
            <nav className="hidden md:flex items-center gap-4">
                <Link href="/jobs">Jobs</Link>
                <Link href="/technicians">Technicians</Link>
                <Link href="/invoices">Invoices</Link>
                <Link href="/analytics">Analytics</Link>
                <Button variant="outline">Logout</Button>
            </nav>
            <ThemeToggle />
        </header>
    );
}
