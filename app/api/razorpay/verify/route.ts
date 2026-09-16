// Location: app/api/razorpay/verify/route.ts
import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import prisma from '@/lib/prisma';
import { clearCart } from '@/server/actions/cart';

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = await req.json();

    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // Update order in database if orderNumber is provided
    if (orderNumber) {
      await prisma.order.updateMany({
        where: { orderNumber },
        data: {
          status: 'CONFIRMED',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paidAt: new Date(),
        },
      });
    }

    // Clear cart
    try {
      await clearCart();
    } catch {
      // Non-blocking if cart clear fails
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Your Jhumka Junction order is confirmed. ✨',
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
