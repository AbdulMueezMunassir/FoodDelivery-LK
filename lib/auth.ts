import { cookies } from 'next/headers';
import { prisma, SafeUser, sanitizeUser } from '@/lib/db';

export async function getSessionUser(): Promise<SafeUser | null> {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('user');

  if (!userCookie) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie.value) as Partial<SafeUser>;

    if (!user.id || !user.email) {
      return null;
    }

    const databaseUser = await prisma.user.findUnique({ where: { id: user.id } });
    return databaseUser ? sanitizeUser(databaseUser) : null;
  } catch {
    return null;
  }
}
