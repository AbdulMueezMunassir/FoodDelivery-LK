const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const LEGACY_EMAILS = ['admin@fooddelivery.lk', 'demo@example.com'];

async function main() {
  const [emailArg, password, ...nameParts] = process.argv.slice(2);

  if (!emailArg || !password) {
    console.error('Usage: node scripts/create-admin.js <email> <password> [name]');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Use a password of at least 12 characters.');
    process.exit(1);
  }

  const email = emailArg.trim().toLowerCase();
  const name = nameParts.join(' ').trim() || 'Admin';
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN', name },
    create: { email, name, passwordHash, role: 'ADMIN' },
  });

  const removed = await prisma.user.deleteMany({
    where: { email: { in: LEGACY_EMAILS.filter((legacy) => legacy !== email) } },
  });

  console.log(`Admin ready: ${email}`);
  console.log(`Removed ${removed.count} legacy default account(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());