import { NextResponse } from 'next/server';
import { clearSessionCookie } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}

export async function GET(request: Request) {
  await clearSessionCookie();
  const url = new URL('/student/login', request.url);
  return NextResponse.redirect(url);
}
