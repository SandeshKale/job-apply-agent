import fs from 'fs/promises';
import path from 'path';
import type { AppliedRecord, UserConfig, RunState } from '@/types';
import { SANDESH_DEFAULT_CONFIG } from './default-config';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const APPLIED_PATH = path.join(DATA_DIR, 'applied.json');
const RUN_STATE_PATH = path.join(DATA_DIR, 'run-state.json');

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function loadConfig(): Promise<UserConfig> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<UserConfig>;
    return { ...SANDESH_DEFAULT_CONFIG, ...parsed };
  } catch {
    await saveConfig(SANDESH_DEFAULT_CONFIG);
    return { ...SANDESH_DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: UserConfig): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function loadApplied(): Promise<AppliedRecord[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(APPLIED_PATH, 'utf-8');
    return JSON.parse(raw) as AppliedRecord[];
  } catch {
    return [];
  }
}

export async function saveApplied(records: AppliedRecord[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(APPLIED_PATH, JSON.stringify(records, null, 2), 'utf-8');
}

export async function appendApplied(record: AppliedRecord): Promise<void> {
  const all = await loadApplied();
  all.push(record);
  await saveApplied(all);
}

export async function loadRunState(): Promise<RunState> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(RUN_STATE_PATH, 'utf-8');
    return JSON.parse(raw) as RunState;
  } catch {
    return { status: 'idle', selectedJobs: [], applied: [], logs: [] };
  }
}

export async function saveRunState(state: RunState): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(RUN_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

/** Keep only last 90 days of applied records to avoid unbounded growth. */
export async function pruneApplied(days = 90): Promise<number> {
  const all = await loadApplied();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const kept = all.filter((r) => new Date(r.timestamp).getTime() >= cutoff);
  const removed = all.length - kept.length;
  if (removed > 0) await saveApplied(kept);
  return removed;
}
