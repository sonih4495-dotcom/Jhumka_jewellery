import { prisma } from '../lib/prisma';

async function main() {
  try {
    const [users, categories, products, images, orders] = await Promise.all([
      prisma.user.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.productImage.count(),
      prisma.order.count(),
    ]);

    console.log('Database Connection Success:');
    console.log({
      users,
      categories,
      products,
      images,
      orders,
    });

    const sampleProducts = await prisma.product.findMany({
      take: 5,
      include: { images: true, category: true },
    });
    console.log('Sample Products:', JSON.stringify(sampleProducts, null, 2));
  } catch (error: any) {
    console.error('Database connection error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
