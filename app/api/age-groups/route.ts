import { NextResponse } from 'next/server';
import { getAllAgeGroups } from '@/lib/services/supabase-events';

export async function GET() {
  try {
    const ageGroups = await getAllAgeGroups();
    
    return NextResponse.json({
      success: true,
      data: ageGroups
    });

  } catch (error) {
    console.error('Age Groups API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}