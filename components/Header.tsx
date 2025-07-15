'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';




export default function Header() {
    const { theme, setTheme } = useTheme();

    return (
        <header className="flex justify-between items-center p-4 border-b shadow-sm">
            <Link href="/dashboard" className="text-xl font-bold">
                QuickSet
            </Link>
            <nav className="space-x-4">
                <Link href="/jobs">Jobs</Link>
                <Link href="/technicians">Technicians</Link>
                <Link href="/analytics">Analytics</Link>
                <Button variant="outline">Logout</Button>
            </nav>

            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
        </header>
    );
}
