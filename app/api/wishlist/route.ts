// Location: app/api/wishlist/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/roles';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            images: { take: 2, orderBy: { position: 'asc' } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      wishlist: wishlists.map(w => ({
        id: w.id,
        productId: w.productId,
        product: {
          id: w.product.id,
          name: w.product.name,
          slug: w.product.slug,
          price: Number(w.product.price),
          comparePrice: w.product.comparePrice ? Number(w.product.comparePrice) : null,
          badge: w.product.badge,
          material: w.product.material,
          images: w.product.images.map(img => ({ url: img.url })),
        },
      })),
    });
  } catch (error) {
    console.error('Wishlist GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    if (!user) {
      // Guest users can track wishlist in localStorage
      return NextResponse.json({ success: true, guest: true, productId });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      // Toggle off
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, action: 'removed', productId });
    } else {
      // Toggle on
      const created = await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      return NextResponse.json({ success: true, action: 'added', wishlist: created });
    }
  } catch (error) {
    console.error('Wishlist POST error:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
