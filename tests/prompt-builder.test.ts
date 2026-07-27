import { describe, it, expect } from 'vitest';
import { buildAgentTaskPrompt, buildRankingOnlyPrompt } from '@/lib/prompt-builder';
import { SANDESH_DEFAULT_CONFIG } from '@/lib/default-config';
import type { ScoredJob } from '@/types';

describe('prompt builders', () => {
  it('includes selected jobs and safety rules in apply prompt', () => {
    const selected: ScoredJob[] = [
      {
        id: '1',
        platform: 'linkedin',
        title: 'Lead Backend Engineer',
        company: 'TestCo',
        url: 'https://linkedin.com/jobs/view/123',
        hasEasyApply: true,
        isExternalAts: false,
        score: 80,
        scoreBreakdown: { easyApply: 30 },
        rank: 1,
      },
    ];
    const prompt = buildAgentTaskPrompt(SANDESH_DEFAULT_CONFIG, selected, []);
    expect(prompt).toContain('Lead Backend Engineer');
    expect(prompt).toContain('TestCo');
    expect(prompt).toContain('CAPTCHA');
    expect(prompt).toContain(SANDESH_DEFAULT_CONFIG.fullName);
    expect(prompt).toContain('APPLY_RESULT');
  });

  it('ranking prompt asks for JSON candidates only', () => {
    const prompt = buildRankingOnlyPrompt(SANDESH_DEFAULT_CONFIG);
    expect(prompt).toContain('JSON array');
    expect(prompt).toContain('hasEasyApply');
    expect(prompt).not.toContain('Submit application');
  });
});
