import type { UserConfig, AppliedRecord, ScoredJob } from '@/types';

export function buildAgentTaskPrompt(
  config: UserConfig,
  selected: ScoredJob[],
  applied: AppliedRecord[],
): string {
  const already = applied
    .slice(-40)
    .map((a) => `- [${a.platform}] ${a.title} @ ${a.company} (${a.status})`)
    .join('\n');

  const selectedList = selected
    .map(
      (j, i) =>
        `${i + 1}. [${j.platform}] score=${j.score} | ${j.title} @ ${j.company}\n   URL: ${j.url}\n   EasyApply: ${j.hasEasyApply} | External: ${j.isExternalAts}`,
    )
    .join('\n');

  return `
You are executing the job-apply-agent daily workflow for ${config.fullName ?? 'the user'}.

GOAL
Apply to the pre-selected high-quality jobs listed below (already ranked).
Respect platform quotas and safety rules. Do not invent new jobs outside this list unless a listed URL is dead — then skip it.

SELECTED JOBS (apply in this order)
${selectedList || '(none — ranking produced empty list)'}

USER PROFILE
- Name: ${config.fullName}
- Headline: ${config.headline}
- Resume file: ${config.resumePath}
- Experience: ${config.experienceYears} years
- Skills: ${config.skills.join(', ')}
- Preferred locations: ${config.location.join(', ')}
- Notice period: ${config.noticePeriodDays} days
- Visa sponsorship needed: ${config.visaSponsorship}
- Profile summary: ${config.profileSummary.slice(0, 800)}

PRE-WRITTEN ANSWERS (prefer these)
${Object.entries(config.profileAnswers)
  .map(([k, v]) => `- "${k}": ${v}`)
  .join('\n')}

ALREADY APPLIED (do not re-apply)
${already || '(none yet)'}

STRICT RULES
1. Prefer Easy Apply / Quick Apply only. Skip pure external ATS unless the user has enabled it.
2. Upload the resume from the path above when prompted.
3. Answer screening questions truthfully. Never invent years of experience, titles, or skills.
4. Human-like delays: ${config.delays.actionMin}-${config.delays.actionMax}s between actions, ${config.delays.betweenApplicationsMin}-${config.delays.betweenApplicationsMax}s between full applications. Longer break every ${config.delays.longBreakEveryN} apps.
5. After every successful or failed attempt, emit a structured log line:
   APPLY_RESULT|platform=...|title=...|company=...|url=...|status=applied|score=...
   or status=skipped / failed with reason.
6. If CAPTCHA, "unusual activity", login wall, or weekly limit appears → STOP immediately and report the exact message.
7. Never exceed ${config.maxDailyApplications} total applications.
8. Browser mode preferred: ${config.browser.mode} (real Chrome profile recommended).

Begin with the first selected job. After finishing the list (or stopping early), output a final SUMMARY table.
`.trim();
}

export function buildRankingOnlyPrompt(config: UserConfig): string {
  return `
Search LinkedIn Jobs and Naukri for the following queries and return a JSON array of candidate jobs (max 40 total).

LinkedIn queries: ${config.linkedinSearchQueries.join(' | ')}
Naukri queries: ${config.naukriSearchQueries.join(' | ')}
Locations: ${config.location.join(', ')}
Experience ~${config.experienceYears} years

For each job return:
{
  "platform": "linkedin" | "naukri",
  "title": "...",
  "company": "...",
  "location": "...",
  "url": "...",
  "postedAt": "...",
  "description": "first 400 chars",
  "hasEasyApply": true/false,
  "isExternalAts": true/false
}

Prefer Easy Apply / recent postings. Do not apply — only collect candidates.
`.trim();
}
