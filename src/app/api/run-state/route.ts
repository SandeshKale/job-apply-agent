import { NextResponse } from 'next/server';
import { loadRunState, saveRunState } from '@/lib/storage';
import { getErrorMessage } from '@/lib/utils';
import type { RunState } from '@/types';

export async function GET() {
  try {
    const state = await loadRunState();
    return NextResponse.json(state);
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to load run state') },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<RunState>;
    const current = await loadRunState();
    const next: RunState = { ...current, ...body };
    await saveRunState(next);
    return NextResponse.json(next);
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err, 'Failed') }, { status: 500 });
  }
}
