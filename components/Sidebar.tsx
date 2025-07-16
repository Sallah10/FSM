'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Briefcase,
    LayoutDashboard,
    Users,
    BarChart,
    UserPlus,
    LogOut,
    Menu,
    FileText,
    X,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Jobs', href: '/jobs', icon: <Briefcase size={18} /> },
    { label: 'Technicians', href: '/technicians', icon: <Users size={18} /> },
    { label: 'Customers', href: '/customers', icon: <UserPlus size={18} /> },
    { label: 'Invoices', href: '/invoices', icon: <FileText size={18} /> },
    { label: 'Analytics', href: '/analytics', icon: <BarChart size={18} /> },
];

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const SidebarContent = (
        <>
            <h2 className="text-xl font-bold mb-6">QuickSet</h2>
            <nav className="space-y-2">
                {navItems.map((item) => (
                    // <Link
                    //     key={item.href}
                    //     href={item.href}
                    //     className={cn(
                    //         'flex items-center gap-3 p-2 rounded-md text-sm font-medium hover:bg-muted transition-all',
                    //         pathname.startsWith(item.href) && 'bg-muted'
                    //     )}
                    //     onClick={() => setMobileOpen(false)}
                    // >
                    //     {item.icon}
                    //     {item.label}
                    // </Link>
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 p-2 rounded-md text-sm transition-all font-medium hover:bg-muted',
                            pathname.startsWith(item.href)
                                ? 'bg-muted font-semibold text-primary scale-[0.8]'
                                : 'text-muted-foreground'
                        )}
                        onClick={() => setMobileOpen(false)}
                    >
                        <div className={cn(
                            "transition-transform",
                            pathname.startsWith(item.href) ? "scale-110" : "scale-100"
                        )}>
                            {item.icon}
                        </div>
                        <span>{item.label}</span>
                    </Link>

                ))}
            </nav>
            <div className="mt-auto pt-6">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar - Desktop */}
            <aside className="w-64 hidden md:flex flex-col border-r p-4 bg-background">
                {SidebarContent}
            </aside>

            {/* Sidebar - Mobile Drawer */}


            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-50  flex"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-64 bg-background border-r p-4 relative z-50 shadow-lg  backdrop-blur-sm"
                        >
                            <div className="bg-background h-full w-full rounded-lg p-2">
                                <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden mb-4">
                                    <X size={20} />
                                </button>
                                {SidebarContent}
                            </div>
                        </motion.div>

                        {/* Backdrop */}
                        <motion.div
                            className="flex-1 bg-black/50 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden">
                            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <span className="font-bold text-lg md:hidden">QuickSet</span>
                    </div>
                    <ThemeToggle />
                </header>

                <main className="p-4">{children}</main>
            </div>
        </div>
    );
}
