// Location: app/api/coupon/validate/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, message: 'Invalid coupon code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check pre-configured promotional codes
    if (cleanCode === 'DRIP10' || cleanCode === 'JHUMKA10') {
      const discount = Math.round(cartTotal * 0.10);
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountPercent: 10,
        discountAmount: discount,
        message: '10% Jhumka Junction discount applied! ✨',
      });
    }

    if (cleanCode === 'BESTIE20') {
      if (cartTotal < 1499) {
        return NextResponse.json({
          valid: false,
          message: 'BESTIE20 is valid on orders above ₹1,499',
        }, { status: 400 });
      }
      const discount = Math.round(cartTotal * 0.20);
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountPercent: 20,
        discountAmount: discount,
        message: '20% Bestie Squad discount applied! 👯‍♀️',
      });
    }

    if (cleanCode === 'SILVER500') {
      if (cartTotal < 1999) {
        return NextResponse.json({
          valid: false,
          message: 'SILVER500 is valid on orders above ₹1,999',
        }, { status: 400 });
      }
      return NextResponse.json({
        valid: true,
        code: cleanCode,
        discountPercent: 0,
        discountAmount: 500,
        message: 'Flat ₹500 off applied on your order! ✨',
      });
    }

    // Check database for dynamically created coupons
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired coupon code' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: 'Coupon code has expired' }, { status: 400 });
    }

    if (coupon.minOrderAmount && cartTotal < Number(coupon.minOrderAmount)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      }, { status: 400 });
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = Math.round((cartTotal * Number(coupon.discountPercent)) / 100);
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else if (coupon.discountAmount) {
      discount = Number(coupon.discountAmount);
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountPercent: coupon.discountPercent ? Number(coupon.discountPercent) : 0,
      discountAmount: discount,
      message: `Coupon ${coupon.code} applied successfully! 🎉`,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ valid: false, message: 'Failed to apply coupon' }, { status: 500 });
  }
}
