import { NextResponse } from 'next/server';
import { createMessage, listMessages } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { chatRoomIdSchema, createMessageSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const room = new URL(req.url).searchParams.get('room') ?? 'general';
  const parsed = chatRoomIdSchema.safeParse(room);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Unknown room' }, { status: 400 });
  }

  return NextResponse.json({
    messages: await listMessages(auth.context.orgId, parsed.data),
  });
}

export async function POST(req: Request) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid message', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const author = {
    id: auth.context.userId,
    name: auth.context.name ?? auth.context.email ?? 'Member',
  };

  return NextResponse.json(
    { message: await createMessage(auth.context.orgId, author, parsed.data) },
    { status: 201 },
  );
}
