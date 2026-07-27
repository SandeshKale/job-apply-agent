import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppliedRecord, UserConfig, RunState } from '@/types';
import { SANDESH_DEFAULT_CONFIG } from './default-config';

const CONFIG_ID = 'default';
const RUN_STATE_ID = 'default';

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export async function loadConfig(): Promise<UserConfig> {
  const { data, error } = await getClient()
    .from('job_apply_config')
    .select('data')
    .eq('id', CONFIG_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    await saveConfig(SANDESH_DEFAULT_CONFIG);
    return { ...SANDESH_DEFAULT_CONFIG };
  }
  return { ...SANDESH_DEFAULT_CONFIG, ...(data.data as Partial<UserConfig>) };
}

export async function saveConfig(config: UserConfig): Promise<void> {
  const { error } = await getClient()
    .from('job_apply_config')
    .upsert({ id: CONFIG_ID, data: config, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function loadApplied(): Promise<AppliedRecord[]> {
  const { data, error } = await getClient()
    .from('job_apply_applied')
    .select('id, platform, title, company, url, timestamp, status, reason, score')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AppliedRecord[];
}

export async function saveApplied(records: AppliedRecord[]): Promise<void> {
  const { error: deleteError } = await getClient()
    .from('job_apply_applied')
    .delete()
    .not('id', 'is', null);
  if (deleteError) throw deleteError;
  if (records.length > 0) {
    const { error } = await getClient().from('job_apply_applied').insert(records);
    if (error) throw error;
  }
}

export async function appendApplied(record: AppliedRecord): Promise<void> {
  const { error } = await getClient().from('job_apply_applied').upsert(record);
  if (error) throw error;
}

export async function loadRunState(): Promise<RunState> {
  const { data, error } = await getClient()
    .from('job_apply_run_state')
    .select('data')
    .eq('id', RUN_STATE_ID)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { status: 'idle', selectedJobs: [], applied: [], logs: [] };
  return data.data as RunState;
}

export async function saveRunState(state: RunState): Promise<void> {
  const { error } = await getClient()
    .from('job_apply_run_state')
    .upsert({ id: RUN_STATE_ID, data: state, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Keep only last 90 days of applied records to avoid unbounded growth. */
export async function pruneApplied(days = 90): Promise<number> {
  const cutoffIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await getClient()
    .from('job_apply_applied')
    .delete()
    .lt('timestamp', cutoffIso)
    .select('id');
  if (error) throw error;
  return data?.length ?? 0;
}
