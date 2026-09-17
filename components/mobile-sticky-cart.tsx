// Location: components/mobile-sticky-cart.tsx
'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { AddToCart } from './add-to-cart';
import { useWishlist } from './wishlist-provider';
import { Heart } from 'lucide-react';

interface MobileStickyCartProps {
  productId: string;
  price: number;
  comparePrice?: number | null;
  disabled?: boolean;
  maxQuantity?: number;
  productName: string;
}

export function MobileStickyCart({
  productId,
  price,
  comparePrice,
  disabled = false,
  maxQuantity = 10,
  productName,
}: MobileStickyCartProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-stone-200/90 px-4 py-3 shadow-[0_-10px_35px_rgba(0,0,0,0.08)] pb-safe">
      <div className="flex items-center gap-3">
        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={() => toggleWishlist(productId)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-stone-200 shadow-sm text-stone-600 transition-transform active:scale-90"
          aria-label="Wishlist"
        >
          <Heart
            className={`h-5 w-5 ${
              isWishlisted ? 'fill-rani text-rani' : 'text-stone-500'
            }`}
          />
        </button>

        {/* Price info */}
        <div className="flex flex-col min-w-0 pr-1">
          <span className="text-[10px] uppercase font-bold text-stone-400 truncate tracking-wider">
            Price
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-stone-900 tracking-tight">
              {formatCurrency(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatCurrency(comparePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart button or Stepper */}
        <div className="flex-1">
          <AddToCart
            productId={productId}
            productName={productName}
            price={price}
            comparePrice={comparePrice}
            disabled={disabled}
            maxQuantity={maxQuantity}
            variant="default"
            size="default"
            className="w-full rounded-xl bg-stone-900 text-xs font-bold text-white shadow-md hover:bg-stone-800 border-0 h-11"
          />
        </div>
      </div>
    </div>
  );
}
