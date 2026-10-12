import SidebarLayout from '@/components/Sidebar';

// These pages read straight from SQLite, so they must render on every request.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
