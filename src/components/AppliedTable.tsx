'use client';

import type { AppliedRecord } from '@/types';
import { formatRelativeTime } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

interface Props {
  records: AppliedRecord[];
}

const statusColor: Record<string, string> = {
  applied: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  skipped: 'bg-slate-500/15 text-slate-300 ring-slate-500/30',
  failed: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
  pending: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
};

export function AppliedTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center text-sm text-slate-400">
        No applications logged yet. Run a daily session to populate this list.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Platform</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Company</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 bg-slate-950/50">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-slate-900/60 transition">
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                {formatRelativeTime(r.timestamp)}
              </td>
              <td className="px-4 py-3 capitalize text-slate-300">{r.platform}</td>
              <td className="max-w-[220px] truncate px-4 py-3 font-medium text-slate-100">
                {r.title}
              </td>
              <td className="px-4 py-3 text-slate-300">{r.company}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusColor[r.status] ?? statusColor.pending}`}
                >
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-slate-400 hover:text-brand-400"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
