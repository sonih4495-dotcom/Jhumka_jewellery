// Location: components/product-card.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Heart, Sparkles } from 'lucide-react';
import { AddToCart } from './add-to-cart';
import { useWishlist } from './wishlist-provider';

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

  const discountPercentage = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const isOnSale = comparePrice && comparePrice > price;

  const renderBadge = () => {
    if (badge === 'NEW_DROP' || badge === 'New Drop') {
      return (
        <Badge className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border-0">
          ✨ New Drop
        </Badge>
      );
    }
    if (badge === 'TRENDING' || badge === 'Trending') {
      return (
        <Badge className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border-0">
          🔥 Trending
        </Badge>
      );
    }
    if (badge === 'BESTSELLER' || badge === 'Bestseller') {
      return (
        <Badge className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm border-0">
          👑 Bestseller
        </Badge>
      );
    }
    if (badge) {
      return (
        <Badge variant="secondary" className="text-[10px] font-medium bg-gray-100 text-gray-800">
          {badge}
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card
      data-testid="product-card"
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-gray-300"
    >
      {/* Product Image Box */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
        <Link href={`/products/${slug}`} className="block h-full w-full">
          <Image
            src={image || '/images/placeholder.svg'}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {renderBadge()}
          {isOnSale && (
            <Badge className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm border-0">
              {discountPercentage}% OFF
            </Badge>
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
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-all hover:bg-white hover:scale-110 active:scale-95"
          aria-label="Save to Wishlist"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted
                ? 'fill-rose-500 text-rose-500'
                : 'text-gray-500 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Quality Badge Watermark */}
        <div className="absolute bottom-2 left-2.5 z-10 rounded-md bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[9px] font-semibold text-white flex items-center gap-1">
          <Sparkles className="h-2.5 w-2.5 text-amber-300" />
          {silverPurity || 'Handcrafted'}
        </div>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <AddToCart
            productId={id}
            disabled={!inStock}
            variant="secondary"
            size="sm"
            className="w-full rounded-xl bg-gray-900 text-xs font-bold text-white shadow-md hover:bg-black backdrop-blur-md border-0"
          />
        </div>
      </div>

      {/* Card Details */}
      <CardContent className="flex flex-1 flex-col p-3.5 sm:p-4 bg-white">
        {/* Category & Purity Line */}
        <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500 font-sans">
          <span>{category?.name || 'Handcrafted'}</span>
          <span className="font-semibold text-rose-600">{material || 'Oxidised'}</span>
        </div>

        {/* Product Title */}
        <Link href={`/products/${slug}`} className="group-hover:text-rose-600 transition-colors">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-semibold text-gray-900 leading-snug font-sans">
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
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">
              ({reviewCount || 1})
            </span>
          </div>
        )}

        <div className="mt-auto pt-2.5 flex items-baseline justify-between font-sans">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-gray-900">
              {formatCurrency(price)}
            </span>
            {comparePrice && comparePrice > price && (
              <span className="text-[11px] text-gray-400 line-through">
                {formatCurrency(comparePrice)}
              </span>
            )}
          </div>
          {inStock ? (
            <span className="text-[10px] font-semibold text-emerald-600">● In Stock</span>
          ) : (
            <span className="text-[10px] font-semibold text-rose-500">Out of Stock</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}