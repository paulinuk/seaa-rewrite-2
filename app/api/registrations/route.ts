import { NextRequest, NextResponse } from 'next/server';
import { createRegistration, getUserRegistrations } from '@/lib/services/supabase-registrations';

export async function POST(request: NextRequest) {
  try {
    const registrationData = await request.json();

    // Validate required fields
    if (!registrationData.userId || !registrationData.meetingId || !registrationData.events) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate events array
    if (!Array.isArray(registrationData.events) || registrationData.events.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one event is required' },
        { status: 400 }
      );
    }

    if (registrationData.events.length > 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum 5 events allowed' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await createRegistration(
      registrationData.userId,
      registrationData.meetingId,
      registrationData.events
    );

    if (!registration) {
      return NextResponse.json(
        { success: false, error: 'Failed to create registration' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: registration
    }, { status: 201 });

  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const registrations = await getUserRegistrations(userId);

    return NextResponse.json({
      success: true,
      data: registrations
    });

  } catch (error) {
    console.error('Get Registrations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}