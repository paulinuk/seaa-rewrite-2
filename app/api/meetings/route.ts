import { NextResponse } from 'next/server';
import { getAllMeetings } from '@/lib/services/supabase-meetings';

export async function GET() {
  try {
    console.log('API: Starting meetings fetch...');

    const meetings = await getAllMeetings();
    console.log('API: Retrieved meetings:', meetings.length);

    return NextResponse.json({
      success: true,
      data: meetings
    });

  } catch (error) {
    console.error('Meetings API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}