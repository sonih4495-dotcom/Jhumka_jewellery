// Location: components/product-card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Sparkles, ShoppingBag } from 'lucide-react';
import { AddToCart } from './add-to-cart';
import { useWishlist } from './wishlist-provider';
import { useCart } from './cart-provider';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  image?: string;
  rating?: number;
  reviewCount?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  category?: {
    name: string;
    slug: string;
  };
  inStock?: boolean;
  badge?: string | null;
  material?: string | null;
  silverPurity?: string | null;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  rating = 0,
  reviewCount = 0,
  status,
  category,
  inStock = true,
  badge,
  material = 'Oxidised Silver Finish',
  silverPurity = 'Premium Quality',
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(id);
  const { getItemQuantity } = useCart();
  const inCartQty = getItemQuantity(id);

  const discountPercentage = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const isOnSale = comparePrice && comparePrice > price;

  const renderBadge = () => {
    if (badge === 'NEW_DROP' || badge === 'New Drop') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-amber-300 shadow-sm border border-amber-400/30">
          <Sparkles className="h-2.5 w-2.5 text-amber-300" /> New Drop
        </span>
      );
    }
    if (badge === 'TRENDING' || badge === 'Trending') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
          🔥 Trending
        </span>
      );
    }
    if (badge === 'BESTSELLER' || badge === 'Bestseller') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rani/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm border border-white/20">
          👑 Bestseller
        </span>
      );
    }
    if (badge) {
      return (
        <Badge variant="secondary" className="text-[10px] font-medium bg-stone-100/90 backdrop-blur-md text-stone-800 rounded-full border border-stone-200">
          {badge}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      data-testid="product-card"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] hover:border-amber-500/40"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
        <Link href={`/products/${slug}`} className="block h-full w-full">
          <Image
            src={image || '/images/placeholder.svg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {renderBadge()}
          {isOnSale && (
            <span className="inline-flex items-center rounded-full bg-rani px-2 py-0.5 text-[10px] font-black text-white shadow-sm">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          }}
          className={`absolute right-2.5 top-2.5 z-20 flex h-8.5 w-8.5 items-center justify-center rounded-full shadow-md transition-all duration-200 hover:scale-110 active:scale-90 ${
            isWishlisted
              ? 'border border-rose-300 shadow-rose-500/20'
              : 'border border-stone-200 hover:border-rose-300'
          }`}
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

        {/* Quality Badge Watermark */}
        <div className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-medium text-stone-100 flex items-center gap-1 border border-white/10">
          <Sparkles className="h-2.5 w-2.5 text-amber-300" />
          {silverPurity || 'Handcrafted'}
        </div>

        {/* Slide-Up Quick Add Overlay */}
        <div className={`absolute inset-x-3 bottom-3 z-10 transition-all duration-300 ease-out ${inCartQty > 0 ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
          <AddToCart
            productId={id}
            productName={name}
            price={price}
            comparePrice={comparePrice}
            image={image}
            slug={slug}
            disabled={!inStock}
            variant="secondary"
            size="sm"
            className="w-full rounded-xl bg-stone-900/95 text-xs font-bold text-white shadow-lg hover:bg-black backdrop-blur-md border border-white/20 transition-all py-2.5"
          />
        </div>
      </div>

      {/* Card Details */}
      <CardContent className="flex flex-1 flex-col p-3.5 sm:p-4 bg-white">
        {/* Category & Material Line */}
        <div className="mb-1 flex items-center justify-between text-[11px] text-stone-500 font-sans">
          <span className="truncate max-w-[120px]">{category?.name || 'Handcrafted'}</span>
          <span className="font-semibold text-rani truncate">{material || 'Oxidised'}</span>
        </div>

        {/* Product Title */}
        <Link href={`/products/${slug}`} className="group-hover:text-rani transition-colors">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-stone-900 leading-snug font-sans">
            {name}
          </h3>
        </Link>

        {/* Ratings */}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1 font-sans">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    i < Math.floor(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-400 font-medium">
              ({reviewCount || 1})
            </span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-baseline justify-between font-sans border-t border-stone-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-stone-900 tracking-tight">
              {formatCurrency(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-[11px] text-stone-400 line-through">
                {formatCurrency(comparePrice)}
              </span>
            )}
          </div>
          {inStock ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="text-[10px] font-bold text-stone-400">
              Out of Stock
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}