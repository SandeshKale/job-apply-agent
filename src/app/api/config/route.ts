import { NextResponse } from 'next/server';
import { loadConfig, saveConfig } from '@/lib/storage';
import { getErrorMessage } from '@/lib/utils';
import type { UserConfig } from '@/types';

export async function GET() {
  try {
    const config = await loadConfig();
    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json(
      { error: getErrorMessage(err, 'Failed to load config') },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Partial<UserConfig>;
    const current = await loadConfig();
    const merged: UserConfig = { ...current, ...body };
    await saveConfig(merged);
    return NextResponse.json(merged);
  } catch (err) {
    return NextResponse.json({ error: getErrorMessage(err, 'Invalid config') }, { status: 400 });
  }
}
