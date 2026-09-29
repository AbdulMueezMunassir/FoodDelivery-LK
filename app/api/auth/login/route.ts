import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { ensureDefaultUsers, prisma, sanitizeUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    await ensureDefaultUsers();

    const body = await request.json();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        {
          error: 'Invalid credentials. Use demo@example.com / password123 or admin@fooddelivery.lk / admin123',
        },
        { status: 401 }
      );
    }

    const safeUser = sanitizeUser(user);
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      message: 'Login successful',
    });

    response.cookies.set({
      name: 'user',
      value: JSON.stringify(safeUser),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
