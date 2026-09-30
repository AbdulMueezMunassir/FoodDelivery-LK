import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const sharedWithOwners = pathname.startsWith('/admin/restaurants') || pathname.startsWith('/owner');

  const allowed = sharedWithOwners
    ? session.role === 'admin' || session.role === 'owner'
    : session.role === 'admin';

  if (!allowed) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*'],
};