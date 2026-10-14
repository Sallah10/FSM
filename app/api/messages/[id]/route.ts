import { NextResponse } from 'next/server';
import { deleteMessage, updateMessage } from '@/lib/db/queries';
import { authorize } from '@/lib/auth/session';
import { editMessageSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = editMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid message', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const message = await updateMessage(
    auth.context.orgId,
    id,
    auth.context.userId,
    parsed.data.body,
  );
  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }
  return NextResponse.json({ message });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const deleted = await deleteMessage(
    auth.context.orgId,
    id,
    auth.context.userId,
  );
  if (!deleted) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
