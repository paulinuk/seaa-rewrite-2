// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { signUp } from '@/lib/services/auth';

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    // Basic validation
    const required = ['firstName', 'surname', 'email', 'password', 'userType'];
    for (const key of required) {
      if (!userData?.[key]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${key}` },
          { status: 400 }
        );
      }
    }

    if (typeof userData.password !== 'string' || userData.password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const { user, needsEmailConfirm, error } = await signUp({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      surname: userData.surname,
      userType: userData.userType, // 'athlete' | 'team_manager'
      clubId: userData.clubId,
      clubRole: userData.clubRole,
      telephone: userData.telephone,
      mobile: userData.mobile,
      clubColours: userData.clubColours,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    if (needsEmailConfirm) {
      return NextResponse.json(
        {
          success: true,
          message: 'Please check your email and click the confirmation link to complete your registration.',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (e) {
    console.error('Register API error:', e);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
