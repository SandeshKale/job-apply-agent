import { NextResponse } from 'next/server';
import { loadConfig, loadApplied } from '@/lib/storage';
import { buildAgentTaskPrompt, buildRankingOnlyPrompt } from '@/lib/prompt-builder';
import type { ScoredJob } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body.mode === 'rank' ? 'rank' : 'apply';
    const selected = (body.selected ?? []) as ScoredJob[];
    const config = await loadConfig();
    const applied = await loadApplied();

    const prompt =
      mode === 'rank'
        ? buildRankingOnlyPrompt(config)
        : buildAgentTaskPrompt(config, selected, applied);

    return NextResponse.json({ prompt, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed' },
      { status: 500 },
    );
  }
}
