import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: "Debug API removed - app now uses mock data",
    status: "working"
  });
}