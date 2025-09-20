import { NextRequest, NextResponse } from 'next/server';
import { searchClubs } from '@/lib/services/supabase-clubs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const clubs = await searchClubs(query);
    
    return NextResponse.json({
      success: true,
      data: clubs
    });

  } catch (error) {
    console.error('Club search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}