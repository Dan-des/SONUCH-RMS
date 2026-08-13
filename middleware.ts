import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET || 'super_secret_better_auth_jwt_key_min_32_chars'
);

const COOKIE_NAME = 'sonuch_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, favicon, logo, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/logo.png'
  ) {
    return NextResponse.next();
  }

  // Handle /pending alias -> redirect to /student/pending
  if (pathname === '/pending') {
    return NextResponse.redirect(new URL('/student/pending', request.url));
  }

  // Public auth routes that don't require session
  const isPublicAuthRoute =
    pathname === '/student/login' ||
    pathname === '/student/register' ||
    pathname === '/admin/login' ||
    pathname === '/' ||
    pathname.startsWith('/api/auth');

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      session = payload;
    } catch {
      session = null;
    }
  }

  // 1. Unauthenticated Protection
  if (!session && !isPublicAuthRoute) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    }
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.redirect(new URL('/student/login', request.url));
  }

  // 2. Role-Based Access Control (RBAC) Guardrails
  if (session) {
    // If student attempts to access protected admin pages (except /admin/login)
    if (
      session.role === 'student' &&
      pathname.startsWith('/admin') &&
      pathname !== '/admin/login'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: '403 Forbidden: Admin access required' }, { status: 403 });
      }
      // Redirect to /admin/login so they can log in as Admin if desired
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If admin attempts to access student protected routes
    if (session.role === 'admin' && pathname.startsWith('/student') && !pathname.startsWith('/student/policies') && pathname !== '/student/login') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: '403 Forbidden: Student portal only' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Pending Verification Student -> Redirected to /student/pending profile setup view only
    if (
      session.role === 'student' &&
      session.status === 'pending_verification' &&
      !pathname.startsWith('/student/pending') &&
      !pathname.startsWith('/api/student/profile') &&
      !pathname.startsWith('/api/auth/logout') &&
      pathname !== '/admin/login' &&
      pathname !== '/student/login'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '403 Forbidden: Account pending admin verification' },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/student/pending', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
