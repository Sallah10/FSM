import SidebarLayout from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
