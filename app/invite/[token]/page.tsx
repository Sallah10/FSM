import Link from 'next/link';
import { AcceptInviteForm } from '@/components/invite/AcceptInviteForm';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Join your team · QuickSet',
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 py-12">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        QuickSet
      </Link>
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <AcceptInviteForm token={token} />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Field service management, minus the busywork.
      </p>
    </div>
  );
}
