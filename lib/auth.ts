import { cookies } from 'next/headers';
import { prisma, SafeUser, sanitizeUser } from '@/lib/db';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export async function getSessionUser(): Promise<SafeUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySession(token);

  if (!session) {
    return null;
  }

  // The role always comes from the database, never from the token.
  const databaseUser = await prisma.user.findUnique({ where: { id: session.sub } });
  return databaseUser ? sanitizeUser(databaseUser) : null;
}