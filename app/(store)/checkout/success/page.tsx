// Location: app/(store)/checkout/success/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Sparkles, Truck, ShieldCheck, ArrowRight, Package } from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ orderNumber?: string; method?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderNumber, method } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="mx-auto max-w-lg rounded-3xl border border-pink-100/80 bg-white p-6 shadow-xl text-center">
        <CardContent className="pt-6 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-green-500 to-emerald-400 text-white shadow-lg shadow-green-500/25 animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              Jhumka Junction Order Placed!
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              Thank You for Your Order! ✨
            </h1>
            <p className="mt-2 text-xs text-gray-500">
              Your handcrafted jewellery pieces are being prepared and packaged with love.
            </p>
          </div>

          <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number:</span>
              <span className="font-mono font-bold text-purple-700">{orderNumber || `JJ-${Date.now()}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method:</span>
              <span className="font-semibold text-gray-900">
                {method === 'upi'
                  ? 'Direct UPI Transfer (sonih4495@ybl)'
                  : method === 'cod'
                  ? 'Cash on Delivery (Pay at Doorstep)'
                  : 'Online Payment'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Delivery:</span>
              <span className="font-semibold text-green-700">3-5 Business Days (Insured)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-gray-100 p-3 bg-pink-50/30">
              <ShieldCheck className="h-4 w-4 text-pink-600 mb-1" />
              <p className="text-[11px] font-bold text-gray-900">Quality Assured</p>
              <p className="text-[10px] text-gray-500">Handcrafted &amp; verified before dispatch</p>
            </div>
            <div className="rounded-xl border border-gray-100 p-3 bg-purple-50/30">
              <Truck className="h-4 w-4 text-purple-600 mb-1" />
              <p className="text-[11px] font-bold text-gray-900">Live SMS &amp; WhatsApp</p>
              <p className="text-[10px] text-gray-500">Tracking updates at every step</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-6 font-bold text-white shadow-md hover:opacity-95">
              <Link href="/products">
                Continue Shopping <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="w-full text-xs text-gray-500 hover:text-purple-600">
              <Link href="/profile">View Order Details in Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
