import type {
  JobCandidate,
  ScoredJob,
  UserConfig,
  RankingWeights,
  AppliedRecord,
} from '@/types';

export const DEFAULT_WEIGHTS: RankingWeights = {
  easyApply: 30,
  posted24h: 25,
  posted3d: 20,
  posted7d: 10,
  exactTitle: 25,
  partialTitle: 15,
  skillMatchPer: 4,
  skillMatchCap: 25,
  preferredCompany: 15,
  experienceMatch: 10,
  locationMatch: 10,
  externalAtsPenalty: -20,
};

function daysSince(postedAt?: string): number | null {
  if (!postedAt) return null;
  const lower = postedAt.toLowerCase();
  if (lower.includes('hour') || lower.includes('minute') || lower.includes('just')) return 0;
  if (lower.includes('1 day') || lower.includes('yesterday')) return 1;
  if (lower.includes('2 day')) return 2;
  if (lower.includes('3 day')) return 3;
  if (lower.includes('week')) return 7;
  const d = Date.parse(postedAt);
  if (Number.isNaN(d)) return null;
  return Math.floor((Date.now() - d) / (1000 * 60 * 60 * 24));
}

function titleMatchScore(
  title: string,
  preferred: string[],
  weights: RankingWeights,
): { score: number; key: string } {
  const t = title.toLowerCase();
  for (const p of preferred) {
    const pl = p.toLowerCase();
    if (t === pl || t.includes(pl) && pl.split(' ').length >= 2) {
      return { score: weights.exactTitle, key: 'exactTitle' };
    }
  }
  for (const p of preferred) {
    const pl = p.toLowerCase();
    if (t.includes(pl) || pl.includes(t.split(' ')[0] ?? '')) {
      return { score: weights.partialTitle, key: 'partialTitle' };
    }
  }
  return { score: 0, key: 'title' };
}

function skillOverlap(
  description: string | undefined,
  skills: string[],
  weights: RankingWeights,
): number {
  if (!description || skills.length === 0) return 0;
  const desc = description.toLowerCase();
  let hits = 0;
  for (const s of skills) {
    if (desc.includes(s.toLowerCase())) hits += 1;
  }
  return Math.min(hits * weights.skillMatchPer, weights.skillMatchCap);
}

function isExcluded(company: string, excluded: string[]): boolean {
  const c = company.toLowerCase();
  return excluded.some((e) => c.includes(e.toLowerCase()));
}

function companyAlreadyCapped(
  company: string,
  selected: ScoredJob[],
  appliedToday: AppliedRecord[],
  maxPerCompany = 2,
): boolean {
  const c = company.toLowerCase();
  const count =
    selected.filter((j) => j.company.toLowerCase() === c).length +
    appliedToday.filter((a) => a.company.toLowerCase() === c && a.status === 'applied').length;
  return count >= maxPerCompany;
}

function alreadyApplied(
  job: JobCandidate,
  applied: AppliedRecord[],
): boolean {
  const urlNorm = job.url.split('?')[0].toLowerCase();
  return applied.some(
    (a) =>
      a.url.split('?')[0].toLowerCase() === urlNorm ||
      (a.company.toLowerCase() === job.company.toLowerCase() &&
        a.title.toLowerCase() === job.title.toLowerCase()),
  );
}

/**
 * Score a single job candidate against user config.
 * Returns null if the job should be discarded (excluded / already applied / visa mismatch).
 */
export function scoreJob(
  job: JobCandidate,
  config: UserConfig,
  applied: AppliedRecord[],
  weights: RankingWeights = DEFAULT_WEIGHTS,
): ScoredJob | null {
  if (isExcluded(job.company, config.excludedCompanies)) return null;
  if (alreadyApplied(job, applied)) return null;
  if (config.visaSponsorship === false && job.description?.toLowerCase().includes('visa sponsorship')) {
    // soft signal only; real filter would need better NLP
  }

  const breakdown: Record<string, number> = {};
  let score = 0;

  if (job.hasEasyApply) {
    breakdown.easyApply = weights.easyApply;
    score += weights.easyApply;
  }

  const days = daysSince(job.postedAt);
  if (days !== null) {
    if (days <= 1) {
      breakdown.recency = weights.posted24h;
      score += weights.posted24h;
    } else if (days <= 3) {
      breakdown.recency = weights.posted3d;
      score += weights.posted3d;
    } else if (days <= 7) {
      breakdown.recency = weights.posted7d;
      score += weights.posted7d;
    }
  }

  const { score: titleScore, key: titleKey } = titleMatchScore(
    job.title,
    config.preferredTitles,
    weights,
  );
  if (titleScore > 0) {
    breakdown[titleKey] = titleScore;
    score += titleScore;
  }

  const skillScore = skillOverlap(job.description, config.skills, weights);
  if (skillScore > 0) {
    breakdown.skills = skillScore;
    score += skillScore;
  }

  if (
    config.preferredCompanies.some((p) =>
      job.company.toLowerCase().includes(p.toLowerCase()),
    )
  ) {
    breakdown.preferredCompany = weights.preferredCompany;
    score += weights.preferredCompany;
  }

  if (job.location && config.location.some((l) => job.location!.toLowerCase().includes(l.toLowerCase()))) {
    breakdown.location = weights.locationMatch;
    score += weights.locationMatch;
  }

  if (job.isExternalAts) {
    breakdown.externalAts = weights.externalAtsPenalty;
    score += weights.externalAtsPenalty;
  }

  return {
    ...job,
    score,
    scoreBreakdown: breakdown,
    rank: 0,
  };
}

/**
 * Rank a pool of candidates and return the top N respecting platform quotas and company diversity.
 */
export function rankAndSelect(
  candidates: JobCandidate[],
  config: UserConfig,
  applied: AppliedRecord[],
  weights: RankingWeights = DEFAULT_WEIGHTS,
): ScoredJob[] {
  const scored: ScoredJob[] = [];
  for (const c of candidates) {
    const s = scoreJob(c, config, applied, weights);
    if (s) scored.push(s);
  }

  scored.sort((a, b) => b.score - a.score);

  const selected: ScoredJob[] = [];
  let liCount = 0;
  let nkCount = 0;

  for (const job of scored) {
    if (selected.length >= config.maxDailyApplications) break;
    if (companyAlreadyCapped(job.company, selected, applied)) continue;

    if (job.platform === 'linkedin') {
      if (liCount >= config.linkedinQuota) continue;
      liCount += 1;
    } else {
      if (nkCount >= config.naukriQuota) continue;
      nkCount += 1;
    }

    selected.push({ ...job, rank: selected.length + 1 });
  }

  return selected;
}

/**
 * Simple hash for stable job identity when URL is missing.
 */
export function jobKey(job: Pick<JobCandidate, 'platform' | 'company' | 'title'>): string {
  return `${job.platform}::${job.company.toLowerCase().trim()}::${job.title.toLowerCase().trim()}`;
}
