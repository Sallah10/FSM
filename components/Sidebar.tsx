'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Briefcase, LayoutDashboard, Users, BarChart, UserPlus, LogOut } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Jobs', href: '/jobs', icon: <Briefcase size={18} /> },
    { label: 'Technicians', href: '/technicians', icon: <Users size={18} /> },
    { label: 'Customers', href: '/customers', icon: <UserPlus size={18} /> },
    { label: 'Analytics', href: '/analytics', icon: <BarChart size={18} /> },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 hidden md:flex flex-col border-r p-4 bg-muted/20">
                <h2 className="text-xl font-bold mb-6">QuickSet</h2>
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-md text-sm font-medium hover:bg-muted transition-all",
                                pathname.startsWith(item.href) && "bg-muted"
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto pt-6">
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Topbar/Header */}
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="md:hidden font-bold text-lg">QuickSet</div>
                    <ThemeToggle />
                </header>

                {/* Page content */}
                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}
