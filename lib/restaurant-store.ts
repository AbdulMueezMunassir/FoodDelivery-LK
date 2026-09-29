import { prisma } from '@/lib/db';
import { restaurants } from '@/lib/data';

export async function ensureRestaurantCatalog() {
  if (await prisma.restaurant.count()) return;

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
}