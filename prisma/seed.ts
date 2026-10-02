import { Prisma, PrismaClient } from '@prisma/client';
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
  await prisma.$queryRaw`SELECT setval(pg_get_serial_sequence('"Restaurant"', 'id'), (SELECT MAX(id) FROM "Restaurant"))`;

  console.log(`Restaurants: seeded ${restaurants.length}.`);
}

async function seedPromos() {
  const crab = await prisma.restaurant.findFirst({
    where: { name: { contains: 'Crab', mode: 'insensitive' } },
  });

  const promos: Prisma.PromoCreateInput[] = [
    {
      code: 'WELCOME20',
      title: '20% off your first order',
      description: 'Welcome to FoodDelivery LK. Get 20% off your first order, up to LKR 1,000.',
      badge: 'New Users',
      type: 'PERCENT',
      value: 20,
      maxDiscount: 1000,
      firstOrderOnly: true,
    },
    {
      code: 'FREEDEL',
      title: 'Free delivery',
      description: 'Free delivery on orders over LKR 3,000.',
      badge: 'Free Delivery',
      type: 'FREE_DELIVERY',
      minSubtotal: 3000,
    },
    {
      code: 'SAVE10',
      title: '10% off',
      description: '10% off orders over LKR 2,000, up to LKR 600.',
      badge: 'Everyday',
      type: 'PERCENT',
      value: 10,
      maxDiscount: 600,
      minSubtotal: 2000,
    },
  ];

  if (crab) {
    promos.push({
      code: 'CRAB500',
      title: 'LKR 500 off',
      description: `LKR 500 off orders over LKR 5,000 at ${crab.name}.`,
      badge: 'Restaurant Deals',
      type: 'FIXED',
      value: 500,
      minSubtotal: 5000,
      restaurantId: crab.id,
    });
  }

  // update: {} means re-running the seed never resets usage counts or edits you made.
  for (const promo of promos) {
    await prisma.promo.upsert({ where: { code: promo.code }, update: {}, create: promo });
  }

  console.log(`Promos: ${promos.length} ready.`);
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
  await seedPromos();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());