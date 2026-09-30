import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, sanitizeUser } from '@/lib/db';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Compared against when the email doesn't exist, so timing doesn't reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordOk = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !passwordOk) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const safeUser = sanitizeUser(user);
    const token = await signSession({ sub: safeUser.id, role: safeUser.role });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Login successful',
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: token,
      ...sessionCookieOptions,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}