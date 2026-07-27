'use client';

import { useState } from 'react';
import type { ScoredJob, UserConfig } from '@/types';
import { Play, Copy, Check, Terminal, Sparkles } from 'lucide-react';

interface Props {
  config: UserConfig;
  selected: ScoredJob[];
}

export function RunPanel({ config, selected }: Props) {
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'apply' | 'rank'>('apply');

  async function generatePrompt(m: 'apply' | 'rank') {
    setLoading(true);
    setMode(m);
    try {
      const res = await fetch('/api/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: m, selected }),
      });
      const data = await res.json();
      setPrompt(data.prompt);
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt() {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Run daily applications</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Generates a ready-to-paste task for browser-use (CLI or Python agent).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => generatePrompt('rank')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Rank-only prompt
          </button>
          <button
            type="button"
            onClick={() => generatePrompt('apply')}
            disabled={loading || selected.length === 0}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-500 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            {loading ? 'Generating…' : 'Generate apply prompt'}
          </button>
        </div>
      </div>

      {selected.length === 0 && (
        <p className="rounded-lg bg-amber-950/30 px-3 py-2 text-xs text-amber-200/90 ring-1 ring-amber-800/40">
          No jobs selected yet. Paste candidates below or use the rank-only prompt with browser-use
          first, then feed the JSON results into ranking.
        </p>
      )}

      {prompt && (
        <div className="relative">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Terminal className="h-3.5 w-3.5" />
              {mode === 'rank' ? 'Ranking / discovery prompt' : 'Full apply task prompt'}
            </span>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <pre className="max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-300 scrollbar-thin ring-1 ring-slate-800">
            {prompt}
          </pre>
          <p className="mt-3 text-xs text-slate-500">
            Run with browser-use CLI:{' '}
            <code className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">
              browser-use run &quot;…paste prompt…&quot;
            </code>{' '}
            or use the Python runner in <code className="text-slate-400">python/agent_runner.py</code>.
            Preferred browser mode: <strong className="text-slate-300">{config.browser.mode}</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
