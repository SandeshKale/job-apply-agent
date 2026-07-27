import { NextResponse } from 'next/server';
import { loadConfig, loadApplied } from '@/lib/storage';
import { rankAndSelect } from '@/lib/ranking';
import type { JobCandidate } from '@/types';

/**
 * Accepts a list of candidate jobs (from a previous search / manual paste / agent)
 * and returns the ranked top selection according to the user's config.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const candidates = (body.candidates ?? []) as JobCandidate[];
    const config = await loadConfig();
    const applied = await loadApplied();

    const selected = rankAndSelect(candidates, config, applied);
    return NextResponse.json({
      selected,
      totalCandidates: candidates.length,
      selectedCount: selected.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Ranking failed' },
      { status: 500 },
    );
  }
}
