// Location: components/wishlist-button.tsx
'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/wishlist-provider';
import { Button } from '@/components/ui/button';

interface WishlistButtonProps {
  productId: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export function WishlistButton({
  productId,
  variant = 'icon',
  className = '',
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(productId);

  if (variant === 'full') {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => toggleWishlist(productId)}
        className={`rounded-full text-xs font-bold transition-all ${
          isWishlisted
            ? 'bg-rose-50 border-rose-300 text-rose-600 hover:bg-rose-100'
            : 'border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-rose-600'
        } ${className}`}
      >
        <Heart
          className={`mr-1.5 h-3.5 w-3.5 transition-transform ${
            isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-600 stroke-[2]'
          }`}
        />
        {isWishlisted ? 'Saved in Wishlist ❤️' : 'Save to Wishlist'}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={`flex h-8.5 w-8.5 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-90 ${
        isWishlisted
          ? 'border border-rose-300 shadow-rose-500/20'
          : 'border border-stone-200 hover:border-rose-300'
      } ${className}`}
      style={{
        backgroundColor: isWishlisted ? '#fff1f2' : '#ffffff',
      }}
      aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${
          isWishlisted
            ? 'fill-rose-500 text-rose-500 scale-110'
            : 'text-stone-800 hover:text-rose-500 stroke-[2.2]'
        }`}
      />
    </button>
  );
}
