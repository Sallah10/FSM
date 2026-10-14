import AppShell from '@/components/layout/AppShell';
import { LiveRefresh } from '@/components/realtime/LiveRefresh';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// These pages read straight from Postgres, so they must render on every request.
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <AppShell user={session?.user ?? {}}>
      {session?.user?.orgId ? <LiveRefresh orgId={session.user.orgId} /> : null}
      {children}
    </AppShell>
  );
}
