import { NextResponse } from 'next/server';
import { getAllEvents } from '@/lib/services/supabase-events';

export async function GET() {
  try {
    const events = await getAllEvents();
    
    return NextResponse.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Events API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}