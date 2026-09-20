import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET, getSupabasePublicUrl } from '@/lib/supabase';
import prisma from '@/lib/prisma';
import { uploadToSupabase, validateFile } from '@/lib/uploader';

export const dynamic = 'force-dynamic';

// GET: List all media assets in Supabase Storage with DB cross-references
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';

    const foldersToScan = folder ? [folder] : ['products', 'categories', 'banners', 'videos', 'uploads'];
    
    // Fetch products & categories to map links
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          images: { select: { id: true, url: true } },
        },
      }),
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      }),
    ]);

    const allMedia: any[] = [];

    for (const f of foldersToScan) {
      const { data: files, error } = await supabaseAdmin.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .list(f, {
          limit: 100,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.warn(`Error scanning folder ${f}:`, error.message);
        continue;
      }

      if (files) {
        for (const file of files) {
          if (!file.name || file.name === '.emptyFolderPlaceholder') continue;
          
          const fullPath = `${f}/${file.name}`;
          const publicUrl = getSupabasePublicUrl(fullPath);

          // Find if used by products
          const linkedProducts = products
            .filter((p) => p.images.some((img) => img.url.includes(file.name)))
            .map((p) => ({ id: p.id, name: p.name, slug: p.slug }));

          // Find if used by categories
          const linkedCategories = categories
            .filter((c) => c.image && c.image.includes(file.name))
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

          allMedia.push({
            id: file.id || fullPath,
            name: file.name,
            path: fullPath,
            folder: f,
            size: file.metadata?.size || 0,
            mimetype: file.metadata?.mimetype || (f === 'videos' ? 'video/mp4' : 'image/jpeg'),
            updatedAt: file.updated_at || file.created_at,
            publicUrl,
            linkedProducts,
            linkedCategories,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      media: allMedia,
      counts: {
        total: allMedia.length,
        products: allMedia.filter((m) => m.folder === 'products').length,
        categories: allMedia.filter((m) => m.folder === 'categories').length,
        banners: allMedia.filter((m) => m.folder === 'banners').length,
        videos: allMedia.filter((m) => m.folder === 'videos').length,
      },
      availableProducts: products.map((p) => ({ id: p.id, name: p.name })),
      availableCategories: categories.map((c) => ({ id: c.id, name: c.name })),
    });
  } catch (error: any) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch media' }, { status: 500 });
  }
}

// POST: Upload or Replace an image/video in Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';
    const customFilename = formData.get('filename') as string | null;
    const productId = formData.get('productId') as string | null;
    const categoryId = formData.get('categoryId') as string | null;
    const isPrimary = formData.get('isPrimary') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const isVideo = file.type.startsWith('video/') || folder === 'videos';
    validateFile(file, isVideo ? 'video' : 'image');

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Choose filename
    let finalFilename: string;
    if (customFilename) {
      const extMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
      const defaultExt = isVideo ? '.mp4' : '.jpg';
      const ext = extMatch ? extMatch[0].toLowerCase() : defaultExt;
      finalFilename = customFilename.includes('.') ? customFilename : `${customFilename}${ext}`;
    } else {
      const cleanOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      finalFilename = `${Date.now()}_${cleanOriginal}`;
    }

    const storagePath = `${folder}/${finalFilename}`;

    // Upload with upsert (replace if exists)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    const publicUrl = getSupabasePublicUrl(storagePath);

    // If attached to a product, insert into ProductImage
    if (productId) {
      await prisma.productImage.create({
        data: {
          productId,
          url: publicUrl,
          altText: file.name.replace(/\.[^/.]+$/, ''),
        },
      });
    }

    // If attached to a category, update category image
    if (categoryId) {
      await prisma.category.update({
        where: { id: categoryId },
        data: { image: publicUrl },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded and synchronized successfully',
      file: {
        name: finalFilename,
        path: storagePath,
        publicUrl,
        size: buffer.length,
      },
    });
  } catch (error: any) {
    console.error('Error in media upload:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload media' }, { status: 500 });
  }
}

// DELETE: Delete an image from Supabase Storage and remove DB associations
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const deleteFromDb = searchParams.get('deleteFromDb') !== 'false';

    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // Delete from Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .remove([path]);

    if (storageError) {
      throw new Error(`Failed to remove file from Supabase: ${storageError.message}`);
    }

    if (deleteFromDb) {
      const filename = path.split('/').pop() || path;
      
      // Remove any matching ProductImage rows
      await prisma.productImage.deleteMany({
        where: {
          url: {
            contains: filename,
          },
        },
      });

      // Clear any Category images referencing this path
      const affectedCategories = await prisma.category.findMany({
        where: {
          image: {
            contains: filename,
          },
        },
      });

      for (const cat of affectedCategories) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: '' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Image ${path} deleted successfully from Supabase Storage`,
    });
  } catch (error: any) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete media' }, { status: 500 });
  }
}

// PATCH: Link or unlink an existing image to a product or category
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, publicUrl, productId, categoryId, isPrimary } = body;

    if (!publicUrl) {
      return NextResponse.json({ error: 'Missing publicUrl' }, { status: 400 });
    }

    if (action === 'link_product' && productId) {
      await prisma.productImage.create({
        data: {
          productId,
          url: publicUrl,
          altText: 'Product Photo',
        },
      });
      return NextResponse.json({ success: true, message: 'Image linked to product' });
    }

    if (action === 'unlink_product' && productId) {
      await prisma.productImage.deleteMany({
        where: {
          productId,
          url: publicUrl,
        },
      });
      return NextResponse.json({ success: true, message: 'Image unlinked from product' });
    }

    if (action === 'link_category' && categoryId) {
      await prisma.category.update({
        where: { id: categoryId },
        data: { image: publicUrl },
      });
      return NextResponse.json({ success: true, message: 'Image linked to category' });
    }

    return NextResponse.json({ error: 'Invalid action or missing IDs' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in media patch:', error);
    return NextResponse.json({ error: error.message || 'Failed to update image link' }, { status: 500 });
  }
}
