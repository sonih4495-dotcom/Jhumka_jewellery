// Location: components/add-to-cart.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import type { ButtonProps } from '@/components/ui/button';

interface AddToCartProps extends Omit<ButtonProps, 'onClick'> {
  productId: string;
  productName?: string;
  price?: number;
  comparePrice?: number | null;
  image?: string;
  slug?: string;
  maxQuantity?: number;
  showQuantitySelector?: boolean;
  onAddToCart?: () => void;
}

export function AddToCart({
  productId,
  productName,
  price,
  comparePrice,
  image,
  slug,
  maxQuantity = 10,
  showQuantitySelector = false,
  onAddToCart,
  disabled,
  children,
  size,
  className,
  ...props
}: AddToCartProps) {
  const { getItemQuantity, addToCart, incrementQuantity, decrementQuantity } = useCart();
  const quantityInCart = getItemQuantity(productId);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || maxQuantity <= 0) return;

    addToCart(productId, 1, {
      id: productId,
      name: productName || 'Handcrafted Jewellery',
      slug: slug || productId,
      price: price || 0,
      comparePrice: comparePrice || null,
      images: image ? [{ url: image, altText: productName || null }] : [],
    });

    onAddToCart?.();
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    decrementQuantity(productId);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantityInCart < maxQuantity) {
      incrementQuantity(productId);
    }
  };

  // ── VIEW 1: Already In Cart -> Render Interactive " - [qty] + " Stepper ──
  if (quantityInCart > 0) {
    if (size === 'sm') {
      return (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="flex items-center justify-between w-full rounded-xl bg-stone-900 text-white shadow-md border border-amber-400/40 p-1 select-none backdrop-blur-md"
        >
          <button
            type="button"
            onClick={handleDecrement}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-amber-300 hover:bg-stone-700 active:scale-90 transition-all"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>

          <div className="flex items-center gap-1 px-1">
            <span className="text-xs font-black text-white">{quantityInCart}</span>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">in bag</span>
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={quantityInCart >= maxQuantity}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-amber-300 hover:bg-stone-700 active:scale-90 transition-all disabled:opacity-30"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      );
    }

    // Default & Large (e.g. on Product Detail Page & Sticky Mobile Bar)
    return (
      <div
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        className="flex items-center justify-between w-full rounded-full bg-stone-900 text-white shadow-xl border border-amber-400/40 px-3 py-1.5 select-none min-h-[50px] transition-all"
      >
        <button
          type="button"
          onClick={handleDecrement}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-800 text-amber-300 hover:bg-stone-700 active:scale-90 transition-all shadow-sm"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black text-white">{quantityInCart}</span>
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">in your bag ✨</span>
          </div>
          <span className="text-[10px] text-stone-400 font-medium">Tap + or − to adjust</span>
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={quantityInCart >= maxQuantity}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-800 text-amber-300 hover:bg-stone-700 active:scale-90 transition-all shadow-sm disabled:opacity-30"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── VIEW 2: Not In Cart -> Instant 0ms "Add to Bag" Button ──
  return (
    <Button
      type="button"
      onClick={handleAdd}
      disabled={disabled || maxQuantity <= 0}
      size={size}
      className={className}
      data-testid="add-to-cart-btn"
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <ShoppingBag className="h-4 w-4" />
        <span>{children || (size === 'sm' ? 'Quick Add' : 'Add to Bag')}</span>
      </div>
    </Button>
  );
}

// Quick add to cart button
export function QuickAddToCart({
  productId,
  productName,
  price,
  className,
}: {
  productId: string;
  productName?: string;
  price?: number;
  className?: string;
}) {
  return (
    <AddToCart
      productId={productId}
      productName={productName}
      price={price}
      size="sm"
      variant="secondary"
      className={className}
    />
  );
}
