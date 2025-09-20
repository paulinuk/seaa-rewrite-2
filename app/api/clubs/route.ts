import { NextResponse } from 'next/server';
import { getAllClubs } from '@/lib/services/supabase-clubs';

export async function GET() {
  try {
    console.log('🚀 Clubs API: Starting request...');
    
    const clubs = await getAllClubs();
    console.log('🎯 Clubs API: Retrieved clubs:', clubs.length);
    
    return NextResponse.json({
      success: true,
      data: clubs
    });

  } catch (error) {
    console.error('💥 Clubs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}