import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const toneMap = {
  default: 'bg-slate-900 border-slate-800 text-slate-100',
  success: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-100',
  warning: 'bg-amber-950/40 border-amber-800/50 text-amber-100',
  danger: 'bg-rose-950/40 border-rose-800/50 text-rose-100',
};

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <div className={cn('rounded-xl border p-4', toneMap[tone])}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
