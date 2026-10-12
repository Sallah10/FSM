import { NextResponse } from 'next/server';
import { createJob, listJobs } from '@/lib/db/queries';
import { getApiSession } from '@/lib/auth/session';
import { createJobSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ jobs: await listJobs() });
}

export async function POST(req: Request) {
  const session = await getApiSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid job', issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({ job: await createJob(parsed.data) }, { status: 201 });
}
