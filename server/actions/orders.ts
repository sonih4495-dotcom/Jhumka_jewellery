// server/actions/orders.ts

'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/roles';

import { revalidateTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache';

export async function updateOrderStatus(
  orderId: string,
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED',
  notes?: string
) {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const previousStatus = existingOrder.status;

    // Handle inventory restock when order is newly CANCELLED or REFUNDED
    const isNowCancelled = status === 'CANCELLED' || status === 'REFUNDED';
    const wasActive = previousStatus !== 'CANCELLED' && previousStatus !== 'REFUNDED';

    const updateData: any = {
      status,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (status === 'SHIPPED' && !existingOrder.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED' && !existingOrder.deliveredAt) {
      updateData.deliveredAt = new Date();
    } else if (isNowCancelled && !existingOrder.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    const order = await prisma.$transaction(async (tx) => {
      // If order was active and is now cancelled/refunded, restore inventory
      if (isNowCancelled && wasActive && existingOrder.orderItems.length > 0) {
        for (const item of existingOrder.orderItems) {
          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              available: { increment: item.quantity },
              quantity: { increment: item.quantity },
            },
          });
        }
      }

      // If order was cancelled and is now reactivated, decrement inventory again
      if (!isNowCancelled && !wasActive && existingOrder.orderItems.length > 0) {
        for (const item of existingOrder.orderItems) {
          await tx.inventory.updateMany({
            where: { productId: item.productId },
            data: {
              available: { decrement: item.quantity },
              quantity: { decrement: item.quantity },
            },
          });
        }
      }

      return await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          orderItems: {
            include: { product: true },
          },
          user: true,
        },
      });
    });

    revalidateTag(CACHE_TAGS.orders, 'max');
    revalidateTag(CACHE_TAGS.order, 'max');
    revalidateTag(CACHE_TAGS.inventory, 'max');
    revalidateTag(CACHE_TAGS.products, 'max');

    return { success: true, order };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { success: false, error: error.message || 'Failed to update order status' };
  }
}

export async function updateOrderTracking(
  orderId: string,
  courierPartner: string,
  trackingNumber: string,
  notes?: string,
  markAsShipped: boolean = true
) {
  try {
    const updateData: any = {
      courierPartner,
      trackingNumber,
    };

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (markAsShipped) {
      updateData.status = 'SHIPPED';
      updateData.shippedAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
    });

    revalidateTag(CACHE_TAGS.orders, 'max');
    revalidateTag(CACHE_TAGS.order, 'max');

    return { success: true, order };
  } catch (error: any) {
    console.error('Error updating tracking:', error);
    return { success: false, error: error.message || 'Failed to update tracking details' };
  }
}

export async function fulfillOrder(orderId: string) {
  return await updateOrderStatus(orderId, 'SHIPPED');
}

export async function cancelOrder(orderId: string) {
  return await updateOrderStatus(orderId, 'CANCELLED');
}

export async function deleteOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    // If deleting an active order, restore inventory first
    if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') {
      for (const item of order.orderItems) {
        await prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: {
            available: { increment: item.quantity },
            quantity: { increment: item.quantity },
          },
        });
      }
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidateTag(CACHE_TAGS.orders, 'max');
    revalidateTag(CACHE_TAGS.order, 'max');
    revalidateTag(CACHE_TAGS.inventory, 'max');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return { success: false, error: error.message || 'Failed to delete order' };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true },
        },
        user: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

// Returns the signed-in user's most recent shipping address, to prefill
// checkout for returning customers. Returns null for guests or first-time
// customers with no prior order.
export async function getSavedAddressForCurrentUser() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const lastOrder = await prisma.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        shippingName: true,
        shippingAddress: true,
        shippingCity: true,
        shippingState: true,
        shippingZip: true,
        shippingCountry: true,
        customerEmail: true,
        customerPhone: true,
      },
    });

    return lastOrder;
  } catch (error) {
    console.error('Failed to get saved address for user:', error);
    return null;
  }
}

// Order confirmation is reachable right after guest checkout (no session
// yet) and by the signed-in owner. Access is proven either by knowing the
// Stripe session id from the redirect, or by owning the order.
export async function getOrderForConfirmation(
  orderId: string,
  sessionId?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          product: { select: { name: true, slug: true, sku: true, images: true } },
        },
      },
    },
  });

  if (!order) return null;

  const user = await getCurrentUser();
  const ownsOrder = user && order.userId === user.id;
  const provedBySession =
    !!sessionId && !!order.stripeSessionId && sessionId === order.stripeSessionId;

  if (!ownsOrder && !provedBySession) return null;

  return order;
}
