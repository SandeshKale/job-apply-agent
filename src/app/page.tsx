'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { StatCard } from '@/components/StatCard';
import { AppliedTable } from '@/components/AppliedTable';
import { ConfigPanel } from '@/components/ConfigPanel';
import { RunPanel } from '@/components/RunPanel';
import type { AppliedRecord, JobCandidate, ScoredJob, UserConfig } from '@/types';
import {
  CheckCircle2,
  ListOrdered,
  Target,
  Upload,
  Trash2,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function DashboardPage() {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [applied, setApplied] = useState<AppliedRecord[]>([]);
  const [selected, setSelected] = useState<ScoredJob[]>([]);
  const [candidateJson, setCandidateJson] = useState('');
  const [rankingMsg, setRankingMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [cRes, aRes] = await Promise.all([fetch('/api/config'), fetch('/api/applied')]);
      const c = await cRes.json();
      const a = await aRes.json();
      if (!cRes.ok) throw new Error(c?.error ?? 'Failed to load config');
      if (!aRes.ok) throw new Error(a?.error ?? 'Failed to load applied history');
      setConfig(c);
      setApplied(a);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function saveConfig(next: UserConfig) {
    const res = await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(next),
    });
    const data = await res.json();
    setConfig(data);
  }

  async function runRanking() {
    setRankingMsg(null);
    let candidates: JobCandidate[] = [];
    try {
      candidates = JSON.parse(candidateJson) as JobCandidate[];
      if (!Array.isArray(candidates)) throw new Error('Expected array');
    } catch {
      setRankingMsg('Invalid JSON — paste an array of job candidates.');
      return;
    }

    // ensure ids
    candidates = candidates.map((c) => ({
      ...c,
      id: c.id || uuidv4(),
      hasEasyApply: Boolean(c.hasEasyApply),
      isExternalAts: Boolean(c.isExternalAts),
    }));

    const res = await fetch('/api/rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidates }),
    });
    const data = await res.json();
    setSelected(data.selected ?? []);
    setRankingMsg(
      `Ranked ${data.totalCandidates} → selected ${data.selectedCount} (quotas applied)`,
    );
  }

  async function clearApplied() {
    if (!confirm('Clear all applied history?')) return;
    await fetch('/api/applied', { method: 'DELETE' });
    setApplied([]);
  }

  const todayCount = applied.filter((a) => {
    const d = new Date(a.timestamp);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate() &&
      a.status === 'applied'
    );
  }).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading dashboard…
      </div>
    );
  }

  if (loadError || !config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-semibold text-rose-300">Failed to load dashboard</p>
        <p className="max-w-md text-xs text-slate-400">{loadError ?? 'Unknown error'}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            refresh();
          }}
          className="mt-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Applied today" value={todayCount} icon={CheckCircle2} tone="success" />
          <StatCard
            label="Daily limit"
            value={config.maxDailyApplications}
            icon={Target}
            tone="default"
          />
          <StatCard
            label="Selected now"
            value={selected.length}
            icon={ListOrdered}
            tone={selected.length > 0 ? 'warning' : 'default'}
          />
          <StatCard label="History total" value={applied.length} icon={Upload} />
        </div>

        {/* Run + Ranking */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <h2 className="text-sm font-semibold text-white">1. Paste job candidates (JSON)</h2>
              <p className="mt-1 text-xs text-slate-400">
                Collect candidates with browser-use using the rank-only prompt, then paste the JSON
                array here. Or paste manually curated jobs.
              </p>
              <textarea
                rows={8}
                className="mt-3 w-full rounded-lg border-slate-700 bg-slate-950 font-mono text-xs text-slate-200"
                placeholder={`[\n  {\n    "platform": "linkedin",\n    "title": "Lead Backend Engineer",\n    "company": "Example",\n    "url": "https://...",\n    "hasEasyApply": true,\n    "isExternalAts": false,\n    "postedAt": "2 days ago",\n    "description": "..."\n  }\n]`}
                value={candidateJson}
                onChange={(e) => setCandidateJson(e.target.value)}
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={runRanking}
                  className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-white"
                >
                  Rank & select top jobs
                </button>
                {rankingMsg && <span className="text-xs text-slate-400">{rankingMsg}</span>}
              </div>

              {selected.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {selected.map((j) => (
                    <li
                      key={j.id}
                      className="flex items-start justify-between gap-3 rounded-lg bg-slate-950/80 px-3 py-2 text-xs ring-1 ring-slate-800"
                    >
                      <div>
                        <span className="font-medium text-slate-100">
                          #{j.rank} · {j.title}
                        </span>
                        <span className="text-slate-400"> @ {j.company}</span>
                        <div className="mt-0.5 text-slate-500">
                          {j.platform} · score {j.score}
                          {j.hasEasyApply ? ' · Easy Apply' : ''}
                        </div>
                      </div>
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-brand-400 hover:underline"
                      >
                        open
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <RunPanel config={config} selected={selected} />
          </div>

          <div className="lg:col-span-2">
            <ConfigPanel config={config} onSave={saveConfig} />
          </div>
        </section>

        {/* History */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Application history</h2>
            <button
              type="button"
              onClick={clearApplied}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-rose-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          <AppliedTable records={applied} />
        </section>

        <footer className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          Built for daily use · respects LinkedIn & Naukri rate limits · never invents experience
        </footer>
      </main>
    </div>
  );
}
