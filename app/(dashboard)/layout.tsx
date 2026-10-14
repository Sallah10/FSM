import AppShell from '@/components/layout/AppShell';
import { LiveRefresh } from '@/components/realtime/LiveRefresh';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { countUnreadMessages } from '@/lib/db/queries';

// These pages read straight from Postgres, so they must render on every request.
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const orgId = session?.user?.orgId;
  const userId = session?.user?.id;

  const unreadChat =
    orgId && userId ? await countUnreadMessages(orgId, userId, 'general') : 0;

  return (
    <AppShell user={session?.user ?? {}} unreadChat={unreadChat}>
      {orgId ? (
        <LiveRefresh orgId={orgId} tables={['jobs', 'invoices', 'messages']} />
      ) : null}
      {children}
    </AppShell>
  );
}
