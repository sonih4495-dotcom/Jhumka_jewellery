// Location: server/actions/checkout.ts
'use server';

import prisma from '@/lib/prisma';
import { createRazorpayOrder } from '@/lib/razorpay';
import { checkoutSchema } from '@/lib/validators';
import { getCurrentUser } from '@/lib/roles';
import { calculateGst } from '@/lib/utils';
import { revalidateTag } from 'next/cache';
import { getCart, clearCart } from './cart';

export async function createCheckout(formData: FormData) {
  try {
    const rawItems = formData.get('items');
    const rawShippingAddress = formData.get('shippingAddress');
    const rawBillingAddress = formData.get('billingAddress');
    const rawCustomerInfo = formData.get('customerInfo');
    const shippingMethod = (formData.get('shippingMethod') as string) || 'standard';
    const paymentMethod = (formData.get('paymentMethod') as 'UPI' | 'RAZORPAY' | 'COD' | 'STRIPE') || 'UPI';
    const couponCode = (formData.get('couponCode') as string) || undefined;
    const notes = (formData.get('notes') as string) || undefined;

    const checkoutData = {
      items: typeof rawItems === 'string' ? JSON.parse(rawItems) : [],
      shippingAddress: typeof rawShippingAddress === 'string' ? JSON.parse(rawShippingAddress) : {},
      billingAddress: rawBillingAddress ? JSON.parse(rawBillingAddress as string) : undefined,
      customerInfo: typeof rawCustomerInfo === 'string' ? JSON.parse(rawCustomerInfo) : {},
      shippingMethod,
      paymentMethod,
      couponCode,
      notes,
    };

    const validatedData = checkoutSchema.parse(checkoutData);
    const user = await getCurrentUser();

    // Verify checkout items
    if (!validatedData.items || validatedData.items.length === 0) {
      return { success: false, error: 'Your cart is empty.' };
    }

    // Check inventory availability and build verified price map
    const productsById = new Map<string, { name: string; sku: string | null; price: number }>();
    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { inventory: true },
      });

      if (!product || product.status !== 'PUBLISHED') {
        return {
          success: false,
          error: 'One or more items in your order are currently unavailable',
        };
      }

      const availableStock = product.inventory[0]?.available ?? 0;
      if (availableStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${availableStock} available in inventory.`,
        };
      }

      productsById.set(product.id, {
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
      });
    }

    // Calculate verified subtotal directly from real database prices
    let subtotal = 0;
    for (const item of validatedData.items) {
      const pInfo = productsById.get(item.productId);
      if (pInfo) {
        subtotal += pInfo.price * item.quantity;
      }
    }

    // Calculate discount (supports promotional codes + dynamic coupons)
    let discount = 0;
    if (validatedData.couponCode) {
      const code = validatedData.couponCode.trim().toUpperCase();
      if (code === 'DRIP10' || code === 'JHUMKA10') {
        discount = Math.round(subtotal * 0.10);
      } else if (code === 'BESTIE20' && subtotal >= 1499) {
        discount = Math.round(subtotal * 0.20);
      } else if (code === 'SILVER500' && subtotal >= 1999) {
        discount = 500;
      } else {
        const dbCoupon = await prisma.coupon.findUnique({
          where: { code },
        });
        if (dbCoupon && dbCoupon.isActive && (!dbCoupon.expiresAt || new Date(dbCoupon.expiresAt) >= new Date())) {
          if (!dbCoupon.minOrderAmount || subtotal >= Number(dbCoupon.minOrderAmount)) {
            if (dbCoupon.discountPercent) {
              discount = Math.round((subtotal * Number(dbCoupon.discountPercent)) / 100);
              if (dbCoupon.maxDiscount && discount > Number(dbCoupon.maxDiscount)) {
                discount = Number(dbCoupon.maxDiscount);
              }
            } else if (dbCoupon.discountAmount) {
              discount = Number(dbCoupon.discountAmount);
            }
          }
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    // Zero extra tax
    const taxAmount = 0;
    
    // Shipping is always free — we don't charge 🎉
    const shippingCost = 0;

    // COD handling charge (₹49 if under ₹1999)
    const codCharge = validatedData.paymentMethod === 'COD' && discountedSubtotal < 1999 ? 49 : 0;
    const finalShipping = shippingCost + codCharge;

    const total = discountedSubtotal + finalShipping;

    const orderNumber = `JJ-${Date.now()}`;

    // Create Order and decrement Inventory atomically
    const order = await prisma.$transaction(async (tx) => {
      // 1. Decrement inventory for each item
      for (const item of validatedData.items) {
        await tx.inventory.updateMany({
          where: { productId: item.productId },
          data: {
            available: {
              decrement: item.quantity,
            },
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 2. Create Order in DB
      return await tx.order.create({
        data: {
          orderNumber,
          userId: user?.id,
          status: validatedData.paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          paymentMethod: validatedData.paymentMethod,
          subtotal: Number(subtotal),
          discount: Number(discount),
          tax: taxAmount,
          cgst: 0,
          sgst: 0,
          igst: 0,
          shipping: Number(finalShipping),
          total: Number(total),
          currency: 'INR',
          customerEmail: validatedData.customerInfo.email,
          customerPhone: validatedData.customerInfo.phone,
          shippingName: `${validatedData.customerInfo.firstName} ${validatedData.customerInfo.lastName}`,
          shippingAddress: validatedData.shippingAddress.line1 + (validatedData.shippingAddress.line2 ? `, ${validatedData.shippingAddress.line2}` : ''),
          shippingLandmark: validatedData.shippingAddress.landmark || undefined,
          shippingCity: validatedData.shippingAddress.city,
          shippingState: validatedData.shippingAddress.state,
          shippingZip: validatedData.shippingAddress.postalCode,
          shippingCountry: 'IN',
          shippingMethod: validatedData.shippingMethod,
          notes: validatedData.notes,
          orderItems: {
            create: validatedData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              productName: productsById.get(item.productId)?.name ?? item.productId,
              productSku: productsById.get(item.productId)?.sku ?? undefined,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    // If UPI Payment, clear cart and return success redirect
    if (validatedData.paymentMethod === 'UPI') {
      await clearCart();
      revalidateTag('orders', 'max');
      revalidateTag('products', 'max');
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: 'UPI',
        redirectUrl: `/checkout/success?orderNumber=${order.orderNumber}&method=upi`,
      };
    }

    // If Cash on Delivery, clear cart and return immediately
    if (validatedData.paymentMethod === 'COD') {
      await clearCart();
      revalidateTag('orders', 'max');
      revalidateTag('products', 'max');
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: 'COD',
        redirectUrl: `/checkout/success?orderNumber=${order.orderNumber}&method=cod`,
      };
    }

    // Razorpay Flow
    const razorpayOrder = await createRazorpayOrder({
      amountInINR: total,
      receipt: order.orderNumber,
      notes: {
        orderNumber: order.orderNumber,
        email: validatedData.customerInfo.email,
        phone: validatedData.customerInfo.phone || '',
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: 'RAZORPAY',
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      customerInfo: validatedData.customerInfo,
    };
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initialize checkout. Please try again.',
    };
  }
}

export async function calculateShippingCost(
  method: string,
  address: any,
  orderValue: number
): Promise<number> {
  // Free standard shipping for orders ₹999 and above
  if (orderValue >= 999 && method === 'standard') {
    return 0;
  }

  const shippingRates: Record<string, number> = {
    standard: 79,
    express: 149,
    free: 0,
  };

  return shippingRates[method] ?? 79;
}

export async function processSuccessfulPayment(sessionId: string) {
  try {
    revalidateTag('orders', 'max');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to process payment' };
  }
}

export async function getShippingMethods() {
  return [
    {
      id: 'standard',
      name: 'Standard Delivery (Free above ₹999)',
      description: '3-5 business days across India (Delhivery / BlueDart)',
      price: 79,
      estimatedDays: '3-5 Business Days',
    },
    {
      id: 'express',
      name: 'Express Insured Air Shipping',
      description: '1-2 business days with tamper-proof protective packaging',
      price: 149,
      estimatedDays: '1-2 Business Days',
    },
  ];
}
