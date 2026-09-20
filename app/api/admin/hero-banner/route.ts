import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET, getSupabasePublicUrl } from '@/lib/supabase';
import { getStoredHeroBanner, saveStoredHeroBanner } from '@/server/banner-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const banner = getStoredHeroBanner();

    // Fetch existing videos in Supabase storage for quick selection
    const { data: videoFiles } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .list('videos', {
        limit: 100,
        sortBy: { column: 'name', order: 'desc' },
      });

    const videos = (videoFiles || [])
      .filter((file) => file.name && file.name !== '.emptyFolderPlaceholder')
      .map((file) => {
        const fullPath = `videos/${file.name}`;
        return {
          name: file.name,
          url: getSupabasePublicUrl(fullPath),
          size: file.metadata?.size || 0,
          updatedAt: file.updated_at || file.created_at,
        };
      });

    // Also fetch products for 1-click product linking
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: {
          select: { url: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      banner,
      availableVideos: videos,
      availableProducts: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        image: p.images[0]?.url || '',
      })),
    });
  } catch (err: any) {
    console.error('Error fetching admin hero banner data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch banner data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const updated = saveStoredHeroBanner(body);

    try {
      revalidatePath('/');
    } catch (revalidateErr) {
      console.warn('Revalidation warning:', revalidateErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Hero banner video configuration saved successfully!',
      banner: updated,
    });
  } catch (err: any) {
    console.error('Error saving admin hero banner data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update hero banner' },
      { status: 500 }
    );
  }
}
