'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { AddToCart } from './add-to-cart';
import { BuyNowButton } from './buy-now-button';
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xl border-t border-stone-200/90 px-3 py-2.5 shadow-[0_-10px_35px_rgba(0,0,0,0.08)] pb-safe">
      <div className="flex items-center gap-2">
        {/* Price display */}
        <div className="flex flex-col items-start justify-center shrink-0 pr-1 min-w-[56px]">
          <span className="text-xs sm:text-sm font-black text-stone-900 font-sans tracking-tight">
            {formatCurrency(price)}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-[9px] text-stone-400 line-through">
              {formatCurrency(comparePrice)}
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={() => toggleWishlist(productId)}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs transition-transform active:scale-90 ${
            isWishlisted
              ? 'bg-rose-50 border-rose-300 text-rose-500'
              : 'bg-white border-stone-200 text-stone-700 hover:text-rose-500'
          }`}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`h-4 w-4 transition-transform ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-800 stroke-[2]'
            }`}
          />
        </button>

        {/* Add to Cart button */}
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
            className="w-full rounded-xl bg-stone-900 text-xs font-bold text-white shadow-xs hover:bg-black border-0 h-10"
          />
        </div>

        {/* Direct Buy Now button */}
        <div className="flex-1">
          <BuyNowButton
            productId={productId}
            productName={productName}
            price={price}
            comparePrice={comparePrice}
            disabled={disabled}
            maxQuantity={maxQuantity}
            className="w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-black text-xs shadow-xs border-0 h-10"
          >
            ⚡ Buy Now
          </BuyNowButton>
        </div>
      </div>
    </div>
  );
}
