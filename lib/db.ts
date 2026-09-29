import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function ensureDefaultUsers() {
  const seedUsers = [
    {
      email: 'demo@example.com',
      password: 'password123',
      name: 'Demo User',
      role: 'CUSTOMER' as const,
    },
    {
      email: 'admin@fooddelivery.lk',
      password: 'admin123',
      name: 'Admin User',
      role: 'ADMIN' as const,
    },
  ];

  for (const seedUser of seedUsers) {
    const existingUser = await prisma.user.findUnique({ where: { email: seedUser.email } });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: seedUser.email,
          name: seedUser.name,
          passwordHash: await bcrypt.hash(seedUser.password, 10),
          role: seedUser.role,
        },
      });
    }
  }
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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role:
      String(user.role).toUpperCase() === 'ADMIN'
        ? 'admin'
        : String(user.role).toUpperCase() === 'OWNER'
          ? 'owner'
          : 'customer',
  };
}
