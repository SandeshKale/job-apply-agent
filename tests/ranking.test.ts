import { describe, it, expect } from 'vitest';
import { scoreJob, rankAndSelect, jobKey, DEFAULT_WEIGHTS } from '@/lib/ranking';
import type { JobCandidate, UserConfig, AppliedRecord } from '@/types';
import { SANDESH_DEFAULT_CONFIG } from '@/lib/default-config';

const baseConfig: UserConfig = {
  ...SANDESH_DEFAULT_CONFIG,
  maxDailyApplications: 5,
  linkedinQuota: 3,
  naukriQuota: 2,
};

function makeJob(overrides: Partial<JobCandidate> = {}): JobCandidate {
  return {
    id: '1',
    platform: 'linkedin',
    title: 'Lead Backend Engineer',
    company: 'Example Corp',
    url: 'https://linkedin.com/jobs/view/1',
    hasEasyApply: true,
    isExternalAts: false,
    postedAt: '2 days ago',
    description: 'Java Spring Boot Kafka AWS microservices LLM integration',
    ...overrides,
  };
}

describe('scoreJob', () => {
  it('gives high score for Easy Apply + skill match + preferred title', () => {
    const job = makeJob();
    const scored = scoreJob(job, baseConfig, []);
    expect(scored).not.toBeNull();
    expect(scored!.score).toBeGreaterThan(50);
    expect(scored!.scoreBreakdown.easyApply).toBe(DEFAULT_WEIGHTS.easyApply);
  });

  it('discards excluded companies', () => {
    const job = makeJob({ company: 'SpamCo' });
    const cfg = { ...baseConfig, excludedCompanies: ['SpamCo'] };
    expect(scoreJob(job, cfg, [])).toBeNull();
  });

  it('discards already applied jobs by URL', () => {
    const job = makeJob();
    const applied: AppliedRecord[] = [
      {
        id: 'a1',
        platform: 'linkedin',
        title: job.title,
        company: job.company,
        url: job.url,
        timestamp: new Date().toISOString(),
        status: 'applied',
      },
    ];
    expect(scoreJob(job, baseConfig, applied)).toBeNull();
  });

  it('applies external ATS penalty', () => {
    const easy = scoreJob(makeJob({ hasEasyApply: true, isExternalAts: false }), baseConfig, []);
    const external = scoreJob(
      makeJob({ id: '2', hasEasyApply: false, isExternalAts: true }),
      baseConfig,
      [],
    );
    expect(easy!.score).toBeGreaterThan(external!.score);
  });
});

describe('rankAndSelect', () => {
  it('respects quotas and company diversity', () => {
    const candidates: JobCandidate[] = [
      makeJob({ id: '1', company: 'A', title: 'Lead Backend Engineer' }),
      makeJob({ id: '2', company: 'A', title: 'Staff Backend Engineer', url: 'https://x/2' }),
      makeJob({ id: '3', company: 'A', title: 'Principal Engineer', url: 'https://x/3' }),
      makeJob({
        id: '4',
        platform: 'naukri',
        company: 'B',
        title: 'Technical Lead',
        url: 'https://n/4',
      }),
      makeJob({
        id: '5',
        platform: 'naukri',
        company: 'C',
        title: 'Architect GenAI',
        url: 'https://n/5',
      }),
      makeJob({
        id: '6',
        platform: 'naukri',
        company: 'D',
        title: 'Senior Java',
        url: 'https://n/6',
      }),
    ];

    const selected = rankAndSelect(candidates, baseConfig, []);
    expect(selected.length).toBeLessThanOrEqual(5);
    const companyA = selected.filter((s) => s.company === 'A');
    expect(companyA.length).toBeLessThanOrEqual(2);
    const li = selected.filter((s) => s.platform === 'linkedin');
    const nk = selected.filter((s) => s.platform === 'naukri');
    expect(li.length).toBeLessThanOrEqual(3);
    expect(nk.length).toBeLessThanOrEqual(2);
  });

  it('orders by score descending', () => {
    const candidates = [
      makeJob({
        id: 'low',
        title: 'Intern',
        hasEasyApply: false,
        description: 'nothing',
        url: 'https://x/low',
      }),
      makeJob({ id: 'high', title: 'Lead Backend Engineer', url: 'https://x/high' }),
    ];
    const selected = rankAndSelect(candidates, baseConfig, []);
    expect(selected[0].id).toBe('high');
  });
});

describe('jobKey', () => {
  it('is stable and case-insensitive', () => {
    expect(jobKey({ platform: 'linkedin', company: 'Acme', title: 'Eng' })).toBe(
      jobKey({ platform: 'linkedin', company: 'acme', title: 'eng' }),
    );
  });
});
