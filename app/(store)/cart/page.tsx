// Location: app/(store)/cart/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/components/cart-provider';
import { useToast } from '@/components/ui/use-toast';

export default function CartPage() {
  const { items, total: totalAmount, totalItems, updateQuantity, removeItem, isLoading } = useCart();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const isFreeShipping = totalAmount >= 999;
  const amountToFreeShipping = Math.max(0, 999 - totalAmount);

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
    toast({
      title: 'Item removed',
      description: 'Item has been removed from your cart.',
    });
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="text-xs text-gray-500">Loading your shopping bag...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center space-y-5 rounded-3xl border border-gray-200/80 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-sans">
              Your bag is empty
            </h1>
            <p className="mt-1 text-xs text-gray-500">
              Discover our bestselling oxidised jhumkas, rings, and charm sets!
            </p>
          </div>
          <Button asChild className="rounded-full bg-gray-900 text-xs font-bold text-white hover:bg-black px-8 py-6 shadow-sm border-0">
            <Link href="/products">
              Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-sans">
          Shopping Bag
        </h1>
        <p className="mt-1 text-xs text-gray-500">
          {totalItems} {totalItems === 1 ? 'item' : 'items'} in your bag
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert banner */}
          <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-900 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-amber-600" />
                {isFreeShipping ? (
                  <strong className="text-emerald-700">🎉 Congratulations! You have unlocked FREE Express Delivery.</strong>
                ) : (
                  <span>Add <strong className="text-rose-600">{formatCurrency(amountToFreeShipping)}</strong> more to unlock <strong>FREE Shipping</strong>!</span>
                )}
              </span>
              <span className="text-[10px] text-amber-700 font-bold">{Math.round(Math.min(100, (totalAmount / 999) * 100))}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (totalAmount / 999) * 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
            {items.map(item => (
              <div
                key={item.id}
                data-testid="cart-item"
                className="flex items-center gap-4 p-4 sm:p-5 hover:bg-gray-50/50 transition-colors"
              >
                {/* Product Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                  <Image
                    src={item.product.images[0]?.url || '/images/placeholder.png'}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="block truncate text-sm font-bold text-gray-900 hover:text-rose-600 transition-colors"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs font-semibold text-gray-500">
                    {formatCurrency(item.product.price)} each
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating === item.id}
                        className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 rounded-l-md"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-md"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-xs text-gray-400 hover:text-rose-600 flex items-center gap-1 ml-3"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right pl-2">
                  <p className="text-sm sm:text-base font-extrabold text-gray-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
              <Link href="/products">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Bag Subtotal ({totalItems} items)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Estimated Shipping</span>
                <span className={isFreeShipping ? 'text-emerald-600 font-bold' : 'text-gray-900 font-semibold'}>
                  {isFreeShipping ? 'FREE' : formatCurrency(79)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>GST / Tax</span>
                <span className="text-emerald-600 font-semibold">₹0 (Zero Extra Tax)</span>
              </div>

              <Separator />

              <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
                <span>Total Amount</span>
                <span className="text-lg font-black text-rose-600">
                  {formatCurrency(totalAmount + (isFreeShipping ? 0 : 79))}
                </span>
              </div>
            </div>

            <Button
              asChild
              className="w-full rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs py-6 shadow-md border-0"
              size="lg"
            >
              <Link href="/checkout" className="flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>100% Secure Checkout &amp; UPI QR payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Cash on Delivery (COD) available across India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}