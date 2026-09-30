import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'owner';
};

export function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
}): SafeUser {
  const role = String(user.role).toUpperCase();

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: role === 'ADMIN' ? 'admin' : role === 'OWNER' ? 'owner' : 'customer',
  };
}