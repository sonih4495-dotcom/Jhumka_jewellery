// Location: components/cart-drawer.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { getCart, updateCartItem, removeFromCart } from '@/server/actions/cart';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{ url: string; altText?: string | null }>;
  };
}

import { useCart } from '@/components/cart-provider';

interface CartDrawerProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CartDrawer({ trigger, open, onOpenChange }: CartDrawerProps) {
  const { items: cartItems, total: subtotal, totalItems: itemCount, updateQuantity, removeItem, isLoading } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-9 w-9 rounded-full text-stone-700 hover:text-rani hover:bg-stone-200/50"
      data-testid="cart-button"
    >
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rani text-[9px] font-bold text-white shadow-sm animate-pulse">
          {itemCount}
        </span>
      )}
      <span className="sr-only">Open cart</span>
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <SheetTrigger asChild>{trigger}</SheetTrigger>
      ) : open === undefined ? (
        <SheetTrigger asChild>{defaultTrigger}</SheetTrigger>
      ) : null}

      <SheetContent className="flex w-full flex-col sm:max-w-md p-0 bg-white">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-gray-100 text-left">
          <SheetTitle className="flex items-center justify-between text-base font-bold text-gray-900">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-rose-600" />
              Shopping Bag ({itemCount})
            </span>
          </SheetTitle>
          {/* Always Free Shipping Badge */}
          <div className="mt-2 rounded-xl bg-emerald-50 p-2.5 border border-emerald-200/60">
            <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-emerald-600" />
              🎉 FREE Shipping on every order — no minimum, no drama!
            </p>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">Your bag is empty</h3>
              <p className="text-xs text-gray-500 max-w-xs">
                Explore our festive oxidised jhumkas, rings, and charm sets!
              </p>
            </div>
            <Button asChild className="rounded-full bg-gray-900 text-xs font-bold text-white hover:bg-black px-6 shadow-sm">
              <Link href="/products" onClick={() => handleOpenChange(false)}>
                Explore Drops ✨
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-gray-100">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  data-testid="cart-item"
                  className="flex items-center gap-3.5 py-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                    <Image
                      src={
                        item.product.images[0]?.url ||
                        '/images/placeholder.png'
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      onClick={() => handleOpenChange(false)}
                      className="block truncate text-xs font-bold text-gray-900 hover:text-rose-600 transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs font-extrabold text-gray-900">
                      {formatCurrency(item.product.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-6 w-6 items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 rounded-l-md"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-md"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-[11px] font-semibold text-gray-400 hover:text-rose-600 flex items-center gap-0.5 ml-auto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50/60 p-6 space-y-3.5">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 text-sm">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-[11px]">
                  <span>Shipping 🚚</span>
                  <span className="text-emerald-600 font-bold">Nope, it's on us! 😄</span>
                </div>
                <p className="text-[10px] text-gray-400 pt-1">
                  ✓ No hidden charges • 100% Secure Checkout
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <Button asChild size="lg" className="w-full rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-xs py-6 shadow-md border-0">
                  <Link
                    href="/checkout"
                    data-testid="checkout-link"
                    onClick={() => handleOpenChange(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout ({formatCurrency(subtotal)}) <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm" className="w-full rounded-2xl text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-100">
                  <Link href="/cart" onClick={() => handleOpenChange(false)}>
                    View Full Cart Page
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}