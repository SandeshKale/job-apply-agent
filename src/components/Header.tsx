'use client';

import { Briefcase, Github, Shield } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-lg shadow-brand-900/40">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
              Job Apply Agent
            </h1>
            <p className="text-xs text-slate-400">LinkedIn · Naukri · daily top-10</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden items-center gap-1.5 sm:flex">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Safety limits on
          </span>
          <a
            href="https://github.com/SandeshKale"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-slate-800 hover:text-white transition"
          >
            <Github className="h-3.5 w-3.5" />
            SandeshKale
          </a>
        </div>
      </div>
    </header>
  );
}
