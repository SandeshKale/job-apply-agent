import { NextResponse } from 'next/server';
import { loadConfig, saveConfig } from '@/lib/storage';
import type { UserConfig } from '@/types';

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<UserConfig>;
    const current = await loadConfig();
    const merged: UserConfig = { ...current, ...body };
    await saveConfig(merged);
    return NextResponse.json(merged);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid config' },
      { status: 400 },
    );
  }
}
