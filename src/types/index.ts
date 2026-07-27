export type Platform = 'linkedin' | 'naukri';

export type ApplicationStatus = 'applied' | 'skipped' | 'failed' | 'pending';

export interface JobCandidate {
  id: string;
  platform: Platform;
  title: string;
  company: string;
  location?: string;
  url: string;
  postedAt?: string; // ISO or relative
  description?: string;
  hasEasyApply: boolean;
  isExternalAts: boolean;
  experienceRequired?: string;
  salaryHint?: string;
  rawScore?: number;
}

export interface ScoredJob extends JobCandidate {
  score: number;
  scoreBreakdown: Record<string, number>;
  rank: number;
}

export interface AppliedRecord {
  id: string;
  platform: Platform;
  title: string;
  company: string;
  url: string;
  timestamp: string;
  status: ApplicationStatus;
  reason?: string;
  score?: number;
}

export interface ProfileAnswers {
  [questionSnippet: string]: string;
}

export interface DelaysConfig {
  actionMin: number;
  actionMax: number;
  betweenApplicationsMin: number;
  betweenApplicationsMax: number;
  longBreakEveryN: number;
  longBreakMin: number;
  longBreakMax: number;
}

export interface BrowserConfig {
  mode: 'real' | 'remote' | 'local';
  chromeProfileDirectory?: string;
  headless: boolean;
}

export interface UserConfig {
  resumePath: string;
  linkedinSearchQueries: string[];
  naukriSearchQueries: string[];
  location: string[];
  experienceYears: number;
  skills: string[];
  preferredTitles: string[];
  excludedCompanies: string[];
  preferredCompanies: string[];
  expectedCtcLpa?: number;
  currentCtcLpa?: number;
  noticePeriodDays: number;
  visaSponsorship: boolean;
  maxDailyApplications: number;
  linkedinQuota: number;
  naukriQuota: number;
  delays: DelaysConfig;
  profileAnswers: ProfileAnswers;
  profileSummary: string;
  browser: BrowserConfig;
  headline?: string;
  fullName?: string;
}

export interface RunState {
  status: 'idle' | 'ranking' | 'running' | 'paused' | 'completed' | 'error';
  startedAt?: string;
  finishedAt?: string;
  selectedJobs: ScoredJob[];
  applied: AppliedRecord[];
  logs: string[];
  error?: string;
  currentJobIndex?: number;
}

export interface RankingWeights {
  easyApply: number;
  posted24h: number;
  posted3d: number;
  posted7d: number;
  exactTitle: number;
  partialTitle: number;
  skillMatchPer: number;
  skillMatchCap: number;
  preferredCompany: number;
  experienceMatch: number;
  locationMatch: number;
  externalAtsPenalty: number;
}
