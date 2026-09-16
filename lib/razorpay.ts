// Location: lib/razorpay.ts
import Razorpay from 'razorpay';
import crypto from 'crypto';

export function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

export async function createRazorpayOrder({
  amountInINR,
  receipt,
  notes = {},
}: {
  amountInINR: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const razorpay = getRazorpayClient();

  // If Razorpay keys are not yet configured in .env, generate a simulated order ID for smooth testing
  if (!razorpay) {
    return {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      amount: Math.round(amountInINR * 100),
      currency: 'INR',
      receipt,
      isMock: true,
    };
  }

  const options = {
    amount: Math.round(amountInINR * 100), // Amount in paise
    currency: 'INR',
    receipt: receipt.substring(0, 40),
    notes,
  };

  const order = await razorpay.orders.create(options);
  return {
    ...order,
    isMock: false,
  };
}

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (orderId.startsWith('order_mock_')) {
    return true;
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) return true;

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
