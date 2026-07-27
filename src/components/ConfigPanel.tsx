'use client';

import { useState } from 'react';
import type { UserConfig } from '@/types';
import { Save, RotateCcw } from 'lucide-react';

interface Props {
  config: UserConfig;
  onSave: (c: UserConfig) => Promise<void>;
}

export function ConfigPanel({ config, onSave }: Props) {
  const [draft, setDraft] = useState<UserConfig>(config);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await onSave(draft);
      setMsg('Saved');
    } catch {
      setMsg('Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 2500);
    }
  }

  function update<K extends keyof UserConfig>(key: K, value: UserConfig[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Profile & Quotas</h2>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-emerald-400">{msg}</span>}
          <button
            type="button"
            onClick={() => setDraft(config)}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-500 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs">
          <span className="text-slate-400">Resume path</span>
          <input
            className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
            value={draft.resumePath}
            onChange={(e) => update('resumePath', e.target.value)}
          />
        </label>
        <label className="block text-xs">
          <span className="text-slate-400">Experience (years)</span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
            value={draft.experienceYears}
            onChange={(e) => update('experienceYears', Number(e.target.value))}
          />
        </label>
        <label className="block text-xs">
          <span className="text-slate-400">Max daily applications</span>
          <input
            type="number"
            className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
            value={draft.maxDailyApplications}
            onChange={(e) => update('maxDailyApplications', Number(e.target.value))}
          />
        </label>
        <label className="block text-xs">
          <span className="text-slate-400">LinkedIn / Naukri quota</span>
          <div className="mt-1 flex gap-2">
            <input
              type="number"
              className="w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
              value={draft.linkedinQuota}
              onChange={(e) => update('linkedinQuota', Number(e.target.value))}
            />
            <input
              type="number"
              className="w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
              value={draft.naukriQuota}
              onChange={(e) => update('naukriQuota', Number(e.target.value))}
            />
          </div>
        </label>
      </div>

      <label className="block text-xs">
        <span className="text-slate-400">LinkedIn search queries (comma-separated)</span>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
          value={draft.linkedinSearchQueries.join(', ')}
          onChange={(e) =>
            update(
              'linkedinSearchQueries',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </label>

      <label className="block text-xs">
        <span className="text-slate-400">Naukri search queries (comma-separated)</span>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
          value={draft.naukriSearchQueries.join(', ')}
          onChange={(e) =>
            update(
              'naukriSearchQueries',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </label>

      <label className="block text-xs">
        <span className="text-slate-400">Skills (comma-separated)</span>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
          value={draft.skills.join(', ')}
          onChange={(e) =>
            update(
              'skills',
              e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            )
          }
        />
      </label>

      <label className="block text-xs">
        <span className="text-slate-400">Profile summary (used for tailored answers)</span>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-md border-slate-700 bg-slate-950 text-sm text-slate-100"
          value={draft.profileSummary}
          onChange={(e) => update('profileSummary', e.target.value)}
        />
      </label>
    </div>
  );
}
