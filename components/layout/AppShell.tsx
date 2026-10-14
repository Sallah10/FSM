'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  Briefcase,
  FileText,
  LayoutDashboard,
  Map,
  Menu,
  MessageSquare,
  Settings2,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/layout/UserMenu';
import ThemeToggle from '@/components/ThemeToggle';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
};
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Jobs', href: '/jobs', icon: Briefcase },
      { label: 'Service map', href: '/map', icon: Map },
      { label: 'Team chat', href: '/chat', icon: MessageSquare },
    ],
  },
  {
    label: 'Directory',
    items: [
      { label: 'Customers', href: '/customers', icon: Users },
      {
        label: 'Technicians',
        href: '/technicians',
        icon: Wrench,
        roles: ['admin'],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        label: 'Invoices',
        href: '/invoices',
        icon: FileText,
        roles: ['admin', 'dispatcher'],
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        label: 'Analytics',
        href: '/analytics',
        icon: BarChart3,
        roles: ['admin', 'dispatcher'],
      },
    ],
  },
  {
    label: 'Account',
    items: [{ label: 'Settings', href: '/settings', icon: Settings2 }],
  },
];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <Wrench className="size-4" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight">QuickSet</span>
        <span className="text-[11px] text-muted-foreground">Field service</span>
      </span>
    </Link>
  );
}

function Nav({
  role,
  onNavigate,
}: {
  role?: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  // Hide areas the current role can't use; API routes enforce this too.
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || (role ? item.roles.includes(role) : false),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <nav className="flex flex-col gap-5">
      {visibleGroups.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                )}
              >
                <Icon
                  className={cn(
                    'size-4 shrink-0',
                    active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground',
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null; role?: string | null };
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <div className="flex h-14 items-center px-4">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4">
          <Nav role={user.role} />
        </div>
        <div className="border-t border-sidebar-border p-2">
          <div className="flex items-center gap-1">
            <div className="min-w-0 flex-1">
              <UserMenu name={user.name} email={user.email} role={user.role} />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <Brand />
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-14 items-center justify-between px-4">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <Nav role={user.role} onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-sidebar-border p-2">
              <div className="flex items-center gap-1">
                <div className="min-w-0 flex-1">
                  <UserMenu name={user.name} email={user.email} role={user.role} />
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Content */}
      <div className="md:pl-60">
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
