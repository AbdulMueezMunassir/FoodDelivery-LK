import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { restaurants } from '../lib/data';

const prisma = new PrismaClient();

async function seedRestaurants() {
  const existing = await prisma.restaurant.count();

  if (existing > 0) {
    console.log(`Restaurants: ${existing} already present, skipping.`);
    return;
  }

  await prisma.restaurant.createMany({
    data: restaurants.map((restaurant) => ({
      id: restaurant.id,
      ownerUserId: null,
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      rating: restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      deliveryFee: restaurant.deliveryFee,
      emoji: restaurant.emoji,
      image: restaurant.image,
      description: restaurant.description,
      menu: JSON.stringify(restaurant.menu),
    })),
  });

  // Inserting explicit ids does not advance the Postgres id counter.
  // Without this, the first restaurant created from the admin page would fail.
  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"Restaurant"', 'id'), (SELECT MAX(id) FROM "Restaurant"))`;

  console.log(`Restaurants: seeded ${restaurants.length}.`);
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Admin: ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping.');
    return;
  }

  if (password.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const name = process.env.ADMIN_NAME?.trim() || 'Admin';

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN' },
    create: { email, name, passwordHash, role: 'ADMIN' },
  });

  console.log(`Admin: ready (${email}).`);
}

async function main() {
  await seedRestaurants();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());