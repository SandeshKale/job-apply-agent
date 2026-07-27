import { NextResponse } from 'next/server';
import { loadApplied, saveApplied, appendApplied, pruneApplied } from '@/lib/storage';
import type { AppliedRecord } from '@/types';

export async function GET() {
  const records = await loadApplied();
  // newest first
  records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AppliedRecord;
    if (!body.id || !body.platform || !body.title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    await appendApplied(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  await saveApplied([]);
  return NextResponse.json({ ok: true });
}

export async function PATCH() {
  const removed = await pruneApplied(90);
  return NextResponse.json({ removed });
}
