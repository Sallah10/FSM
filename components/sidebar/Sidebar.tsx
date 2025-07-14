'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Brush,
    FileText,
    CreditCard,
    Settings,
    BarChart,
    FileBox
} from 'lucide-react';

const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Analytics', icon: BarChart, path: '/dashboard/analytics' },
    { name: 'My Pages', icon: FileBox, path: '/dashboard/pages' },
    { name: 'Customize Page', icon: Brush, path: '/dashboard/customize' },
    { name: 'Quote Form', icon: FileText, path: '/dashboard/quote-form' },
    { name: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
    { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 min-h-screen bg-white border-r flex flex-col">
            <div className="px-6 py-4 font-bold text-xl">QuickSet</div>
            <nav className="flex flex-col gap-1 px-3">
                {links.map(({ name, icon: Icon, path }) => (
                    <Link
                        key={name}
                        href={path}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100',
                            pathname === path && 'bg-gray-100 text-primary'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        {name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
