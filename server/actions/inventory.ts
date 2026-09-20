// Location: server/actions/inventory.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

export interface CreateProductInput {
  name: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  categoryId?: string | null;
  initialStock: number;
  status: 'PUBLISHED' | 'DRAFT';
  material?: string;
  silverPurity?: string;
  badge?: string | null;
  vibe?: string | null;
  description?: string;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface UpdateProductInput {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  categoryId?: string | null;
  availableStock: number;
  totalStock?: number;
  status: 'PUBLISHED' | 'DRAFT';
  material?: string;
  silverPurity?: string;
  badge?: string | null;
  vibe?: string | null;
  description?: string;
}

/**
 * Create a new jewellery product with its initial stock and multiple images directly in Supabase
 */
export async function createProductAction(data: CreateProductInput) {
  try {
    const name = data.name.trim();
    if (!name) {
      return { success: false, error: 'Product name is required' };
    }

    const sku = data.sku.trim() || `JJ-${Date.now().toString().slice(-6)}`;
    const price = Number(data.price);
    if (isNaN(price) || price < 0) {
      return { success: false, error: 'Valid price is required' };
    }

    // Check SKU uniqueness
    const existingSku = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingSku) {
      return { success: false, error: `SKU "${sku}" is already in use. Please provide a unique SKU.` };
    }

    // Generate SEO slug
    const cleanSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${cleanSlug}-${Date.now().toString().slice(-4)}`;

    const initialStock = Math.max(0, Number(data.initialStock) || 0);

    const imagesToCreate: Array<{ url: string; position: number; altText: string }> = [];
    if (data.imageUrls && data.imageUrls.length > 0) {
      data.imageUrls.forEach((url, idx) => {
        if (url && url.trim()) {
          imagesToCreate.push({
            url: url.trim(),
            position: idx,
            altText: name,
          });
        }
      });
    } else if (data.imageUrl && data.imageUrl.trim()) {
      imagesToCreate.push({
        url: data.imageUrl.trim(),
        position: 0,
        altText: name,
      });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          sku,
          price,
          comparePrice: data.comparePrice ? Number(data.comparePrice) : null,
          description: data.description?.trim() || null,
          status: data.status || 'PUBLISHED',
          material: data.material || 'Oxidised Silver Finish',
          silverPurity: data.silverPurity || 'Handcrafted Quality',
          badge: data.badge && data.badge !== 'NONE' ? data.badge : null,
          vibe: data.vibe && data.vibe !== 'NONE' ? data.vibe : null,
          categoryId: data.categoryId && data.categoryId !== 'none' ? data.categoryId : null,
          images: imagesToCreate.length > 0
            ? {
                create: imagesToCreate,
              }
            : undefined,
        },
        include: {
          images: true,
          category: true,
        },
      });

      // Create inventory record
      await tx.inventory.create({
        data: {
          productId: newProduct.id,
          available: initialStock,
          quantity: initialStock,
          reserved: 0,
        },
      });

      return newProduct;
    });

    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.products, 'max');
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/inventory');
    revalidatePath('/products');

    return { success: true, product };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message || 'Failed to create product' };
  }
}

/**
 * Update existing product details and stock in Supabase
 */
export async function updateProductAction(data: UpdateProductInput) {
  try {
    const { id, name, sku, price, comparePrice, categoryId, availableStock, totalStock, status, material, silverPurity, badge, vibe, description } = data;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return { success: false, error: 'Product not found' };
    }

    // Check SKU if changed
    if (sku && sku !== existingProduct.sku) {
      const skuTaken = await prisma.product.findFirst({
        where: {
          sku,
          NOT: { id },
        },
      });
      if (skuTaken) {
        return { success: false, error: `SKU "${sku}" is already assigned to another product.` };
      }
    }

    const avail = Math.max(0, Number(availableStock) || 0);
    const total = totalStock !== undefined ? Math.max(0, Number(totalStock) || 0) : avail;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: name.trim(),
          sku: sku.trim(),
          price: Number(price),
          comparePrice: comparePrice ? Number(comparePrice) : null,
          description: description?.trim() || null,
          status: status || 'PUBLISHED',
          material: material || 'Oxidised Silver Finish',
          silverPurity: silverPurity || 'Handcrafted Quality',
          badge: badge && badge !== 'NONE' ? badge : null,
          vibe: vibe && vibe !== 'NONE' ? vibe : null,
          categoryId: categoryId && categoryId !== 'none' ? categoryId : null,
        },
      });

      await tx.inventory.upsert({
        where: { productId: id },
        update: {
          available: avail,
          quantity: total,
        },
        create: {
          productId: id,
          available: avail,
          quantity: total,
          reserved: 0,
        },
      });
    });

    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.products, 'max');
    revalidateTag(CACHE_TAGS.product, 'max');
    revalidatePath('/admin/inventory');
    revalidatePath('/products');

    return { success: true };
  } catch (error: any) {
    console.error('Error updating product action:', error);
    return { success: false, error: error.message || 'Failed to update product' };
  }
}

/**
 * 1-Click Toggle Product Status (PUBLISHED <-> DRAFT)
 */
export async function toggleProductStatusAction(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { status: true, name: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const newStatus = product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { status: newStatus },
    });

    revalidateTag(CACHE_TAGS.products, 'max');
    revalidateTag(CACHE_TAGS.product, 'max');
    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidatePath('/admin/inventory');
    revalidatePath('/products');

    return { success: true, newStatus: updated.status };
  } catch (error: any) {
    console.error('Error toggling product status:', error);
    return { success: false, error: error.message || 'Failed to toggle product status' };
  }
}

/**
 * Delete product and associated records from Supabase
 */
export async function deleteProductAction(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Delete inventory and images before deleting product
    await prisma.$transaction(async (tx) => {
      await tx.inventory.deleteMany({ where: { productId } });
      await tx.productImage.deleteMany({ where: { productId } });
      await tx.cartItem.deleteMany({ where: { productId } });
      await tx.product.delete({ where: { id: productId } });
    });

    revalidateTag(CACHE_TAGS.products, 'max');
    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.categories, 'max');
    revalidatePath('/admin/inventory');
    revalidatePath('/products');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message || 'Failed to delete product' };
  }
}

/**
 * Update stock levels directly for a product in Supabase
 */
export async function updateProductStock(
  productId: string,
  available: number,
  totalQuantity?: number
) {
  try {
    const qty = totalQuantity !== undefined ? Math.max(0, totalQuantity) : Math.max(0, available);
    const avail = Math.max(0, available);

    // Upsert inventory record
    const inventory = await prisma.inventory.upsert({
      where: { productId },
      update: {
        available: avail,
        quantity: qty,
      },
      create: {
        productId,
        available: avail,
        quantity: qty,
        reserved: 0,
      },
    });

    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.products, 'max');
    revalidateTag(CACHE_TAGS.product, 'max');
    revalidatePath('/admin/inventory');

    return { success: true, inventory };
  } catch (error: any) {
    console.error('Error updating product stock:', error);
    return { success: false, error: error.message || 'Failed to update stock' };
  }
}

/**
 * Quick increment/decrement adjustment (+1, -1, +5, -5)
 */
export async function adjustStock(productId: string, delta: number) {
  try {
    const current = await prisma.inventory.findUnique({
      where: { productId },
    });

    const currentAvail = current?.available ?? 0;
    const currentQty = current?.quantity ?? 0;
    const newAvail = Math.max(0, currentAvail + delta);
    const newQty = Math.max(0, currentQty + delta);

    const inventory = await prisma.inventory.upsert({
      where: { productId },
      update: {
        available: newAvail,
        quantity: newQty,
      },
      create: {
        productId,
        available: newAvail,
        quantity: newQty,
        reserved: 0,
      },
    });

    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.products, 'max');
    revalidateTag(CACHE_TAGS.product, 'max');
    revalidatePath('/admin/inventory');

    return { success: true, inventory, newAvailable: newAvail };
  } catch (error: any) {
    console.error('Error adjusting stock:', error);
    return { success: false, error: error.message || 'Failed to adjust stock' };
  }
}

/**
 * Batch update multiple inventory items at once
 */
export async function batchUpdateStock(
  updates: Array<{ productId: string; available: number }>
) {
  try {
    const results = await prisma.$transaction(
      updates.map(item =>
        prisma.inventory.upsert({
          where: { productId: item.productId },
          update: {
            available: Math.max(0, item.available),
            quantity: Math.max(0, item.available),
          },
          create: {
            productId: item.productId,
            available: Math.max(0, item.available),
            quantity: Math.max(0, item.available),
            reserved: 0,
          },
        })
      )
    );

    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.products, 'max');
    revalidatePath('/admin/inventory');

    return { success: true, count: results.length };
  } catch (error: any) {
    console.error('Error batch updating stock:', error);
    return { success: false, error: error.message || 'Failed to batch update stock' };
  }
}
