import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authToken = request.cookies.get('auth_token')?.value;
  const pending2FA = request.cookies.get('pending_2fa_user_id')?.value;

  // 1. Redirect away from /login if already authenticated or pending 2FA
  if (pathname === '/login') {
    if (authToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pending2FA) {
      return NextResponse.redirect(new URL('/admin/verify-2fa', request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow access to 2FA verification page if pending 2FA cookie OR auth token exists
  if (pathname === '/admin/verify-2fa') {
    if (pending2FA || authToken) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Protect all other /admin routes (requires full auth token)
  if (pathname.startsWith('/admin')) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
};
