import { NextRequest, NextResponse } from 'next/server';
import { getMeetingById } from '@/lib/services/supabase-meetings';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const meeting = await getMeetingById(params.id);

    if (!meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting
    });

  } catch (error) {
    console.error('Meeting API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}