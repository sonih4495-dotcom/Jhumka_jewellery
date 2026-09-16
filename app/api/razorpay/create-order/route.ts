// Location: app/api/razorpay/create-order/route.ts
import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/roles';

export async function POST(req: Request) {
  try {
    const { amount, orderNumber, notes } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const orderReceipt = orderNumber || `DRIP_${Date.now()}`;
    const razorpayOrder = await createRazorpayOrder({
      amountInINR: amount,
      receipt: orderReceipt,
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      order: razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
