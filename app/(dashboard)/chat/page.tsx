import { listMessages } from '@/lib/db/queries';
import { requireSession } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChatPanel } from '@/components/chat/ChatPanel';

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const { userId, orgId } = await requireSession();
  const messages = await listMessages(orgId, 'general');

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Team chat"
        description="Coordinate with everyone in your workspace, in real time."
      />
      <ChatPanel
        roomId="general"
        initialMessages={messages}
        currentUserId={userId}
        title="General"
        description="Everyone in your organization"
        heightClass="h-[calc(100vh-15rem)] min-h-[22rem]"
      />
    </div>
  );
}
