// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserFromToken } from '@/lib/services/auth';

export async function GET() {
  try {
    // In Next 15 route handlers, cookies() returns a Promise
    const cookieStore = await cookies();
    const token = cookieStore.get('sb')?.value ?? null;

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
