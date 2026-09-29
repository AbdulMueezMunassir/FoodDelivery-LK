import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma, sanitizeUser } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUser = JSON.parse(userCookie.value) as { id?: string };

    if (!sessionUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(sanitizeUser(user));
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
