import { NextResponse } from 'next/server';
import { loadRunState, saveRunState } from '@/lib/storage';
import type { RunState } from '@/types';

export async function GET() {
  const state = await loadRunState();
  return NextResponse.json(state);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<RunState>;
    const current = await loadRunState();
    const next: RunState = { ...current, ...body };
    await saveRunState(next);
    return NextResponse.json(next);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 },
    );
  }
}
