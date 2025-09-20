import { NextResponse } from 'next/server';
import { signOut } from '@/lib/services/auth';

export async function POST() {
  try {
    const { error } = await signOut();
    
    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}