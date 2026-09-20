'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, CartItemProduct } from '@/components/cart-provider';
import type { ButtonProps } from '@/components/ui/button';

interface BuyNowButtonProps extends Omit<ButtonProps, 'onClick'> {
  productId: string;
  productName?: string;
  price?: number;
  comparePrice?: number | null;
  image?: string;
  slug?: string;
  maxQuantity?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function BuyNowButton({
  productId,
  productName,
  price,
  comparePrice,
  image,
  slug,
  maxQuantity = 10,
  disabled = false,
  className,
  children,
  size = 'default',
  ...props
}: BuyNowButtonProps) {
  const router = useRouter();
  const { addToCart, getItemQuantity } = useCart();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled || (maxQuantity !== undefined && maxQuantity <= 0) || isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      // Ensure the product is in the cart
      const currentQty = getItemQuantity(productId);
      if (currentQty === 0) {
        addToCart(productId, 1, {
          id: productId,
          name: productName || 'Handcrafted Jewellery',
          slug: slug || productId,
          price: price || 0,
          comparePrice: comparePrice || null,
          images: image ? [{ url: image, altText: productName || null }] : [],
        });
      }

      // Direct immediate navigation to checkout
      router.push('/checkout');
    } catch (err) {
      console.error('Buy Now navigation error:', err);
      setIsNavigating(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleBuyNow}
      disabled={disabled || isNavigating}
      size={size}
      className={`relative inline-flex items-center justify-center font-bold transition-all active:scale-98 select-none ${
        className || 'w-full rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black shadow-lg hover:shadow-amber-500/25 border-0'
      }`}
      {...props}
    >
      {isNavigating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Checkout...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <Zap className="mr-1.5 h-4 w-4 fill-current" />
          Buy Now
        </>
      )}
    </Button>
  );
}
