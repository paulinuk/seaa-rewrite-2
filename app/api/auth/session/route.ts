// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/services/auth';

export async function GET(req: Request) {
  try {
    // In Node runtime, use the request headers to get cookies
    const cookieHeader = req.headers.get('cookie') ?? '';
    const token = cookieHeader
      .split(';')
      .map(v => v.trim())
      .find(v => v.startsWith('sb='))
      ?.split('=')[1] ?? null;

    const { user, error } = await getUserFromToken(token);

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 401 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (e) {
    console.error('Session API error:', e);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
