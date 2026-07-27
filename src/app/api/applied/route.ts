import { NextResponse } from 'next/server';
import { loadApplied, saveApplied, appendApplied, pruneApplied } from '@/lib/storage';
import { getErrorMessage } from '@/lib/utils';
import type { AppliedRecord } from '@/types';

export async function GET() {
  try {
    const records = await loadApplied();
    // newest first
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return NextResponse.json(records);
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to load applied history') },
      { status: 500 },
    );
  }
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
    return NextResponse.json({ error: getErrorMessage(err, 'Failed') }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await saveApplied([]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to clear history') },
      { status: 500 },
    );
  }
}

export async function PATCH() {
  try {
    const removed = await pruneApplied(90);
    return NextResponse.json({ removed });
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to prune history') },
      { status: 500 },
    );
  }
}
