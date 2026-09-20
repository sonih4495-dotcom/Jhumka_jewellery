import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStoredReels, saveStoredReels, ReelItem } from '@/lib/reels-data';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: List all reels for Admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const reels = getStoredReels();
    return NextResponse.json({ success: true, reels });
  } catch (error: any) {
    console.error('Admin reels GET error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch reels' }, { status: 500 });
  }
}

// POST: Add a new Reel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      creator,
      handle,
      avatar,
      thumbnail,
      videoUrl,
      instagramUrl,
      title,
      likes,
      productId,
    } = body;

    if (!creator || !title) {
      return NextResponse.json({ error: 'Creator name and title are required' }, { status: 400 });
    }

    // Fetch product details if productId is provided
    let taggedProduct: ReelItem['taggedProduct'] = {
      id: productId || 'default-product',
      name: 'Featured Jewellery Piece',
      price: 1299,
      comparePrice: 1999,
      slug: 'all-products',
      image: thumbnail || '/images/placeholder.svg',
    };

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: { take: 1, orderBy: { position: 'asc' } } },
      });

      if (product) {
        taggedProduct = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
          slug: product.slug,
          image: product.images[0]?.url || thumbnail || '/images/placeholder.svg',
        };
      }
    }

    const newReel: ReelItem = {
      id: `reel_${Date.now()}`,
      creator: creator.trim(),
      handle: handle ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) : '@jhumkajunction',
      avatar: avatar || 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery/ui/avatar-ananya.jpg',
      thumbnail: thumbnail || (taggedProduct.image || '/images/placeholder.svg'),
      videoUrl: videoUrl?.trim() || undefined,
      instagramUrl: instagramUrl?.trim() || undefined,
      title: title.trim(),
      likes: likes?.trim() || '10.5K',
      taggedProduct,
      createdAt: new Date().toISOString(),
    };

    const currentReels = getStoredReels();
    const updated = [newReel, ...currentReels];
    saveStoredReels(updated);

    return NextResponse.json({
      success: true,
      message: 'Reel added successfully!',
      reel: newReel,
      reels: updated,
    });
  } catch (error: any) {
    console.error('Admin reels POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create reel' }, { status: 500 });
  }
}

// PUT: Update an existing Reel
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      creator,
      handle,
      avatar,
      thumbnail,
      videoUrl,
      instagramUrl,
      title,
      likes,
      productId,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Reel ID is required' }, { status: 400 });
    }

    const currentReels = getStoredReels();
    const existingIndex = currentReels.findIndex(r => r.id === id);

    if (existingIndex === -1) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    const existingReel = currentReels[existingIndex]!;

    let taggedProduct = existingReel.taggedProduct;
    if (productId && productId !== taggedProduct?.id) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { images: { take: 1, orderBy: { position: 'asc' } } },
      });

      if (product) {
        taggedProduct = {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
          slug: product.slug,
          image: product.images[0]?.url || existingReel.taggedProduct?.image || '/images/placeholder.svg',
        };
      }
    }

    const updatedReel: ReelItem = {
      ...existingReel,
      creator: creator !== undefined ? creator.trim() : existingReel.creator,
      handle: handle !== undefined ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) : existingReel.handle,
      avatar: avatar || existingReel.avatar,
      thumbnail: thumbnail || (taggedProduct?.image || existingReel.thumbnail),
      videoUrl: videoUrl !== undefined ? (videoUrl.trim() || undefined) : existingReel.videoUrl,
      instagramUrl: instagramUrl !== undefined ? (instagramUrl.trim() || undefined) : existingReel.instagramUrl,
      title: title !== undefined ? title.trim() : existingReel.title,
      likes: likes !== undefined ? likes.trim() : existingReel.likes,
      taggedProduct: taggedProduct || existingReel.taggedProduct,
    };

    currentReels[existingIndex] = updatedReel;
    saveStoredReels(currentReels);

    return NextResponse.json({
      success: true,
      message: 'Reel updated successfully!',
      reel: updatedReel,
      reels: currentReels,
    });
  } catch (error: any) {
    console.error('Admin reels PUT error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update reel' }, { status: 500 });
  }
}

// DELETE: Delete a Reel
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reel ID is required' }, { status: 400 });
    }

    const currentReels = getStoredReels();
    const filtered = currentReels.filter(r => r.id !== id);
    saveStoredReels(filtered);

    return NextResponse.json({
      success: true,
      message: 'Reel deleted successfully',
      reels: filtered,
    });
  } catch (error: any) {
    console.error('Admin reels DELETE error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete reel' }, { status: 500 });
  }
}
