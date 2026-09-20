// Location: server/actions/inventory.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

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

    return { success: true, count: results.length };
  } catch (error: any) {
    console.error('Error batch updating stock:', error);
    return { success: false, error: error.message || 'Failed to batch update stock' };
  }
}
