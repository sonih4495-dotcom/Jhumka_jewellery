// Location: app/(store)/wishlist/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/components/wishlist-provider';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        // Check if logged-in user has server-synced items
        try {
          const res = await fetch('/api/wishlist');
          if (res.ok) {
            const data = await res.json();
            if (data.wishlist && data.wishlist.length > 0) {
              const serverProds = data.wishlist.map((w: any) => w.product).filter(Boolean);
              if (serverProds.length > 0) {
                setProducts(serverProds);
                setLoading(false);
                return;
              }
            }
          }
        } catch {
          // Ignore
        }
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/products?ids=${wishlistIds.join(',')}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to load wishlist items:', err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700 mb-2">
          <Heart className="h-3.5 w-3.5 fill-pink-500 text-pink-500" />
          My Saved Pieces
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
          Your Jewellery Wishlist ✨
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Saved handcrafted &amp; oxidised favourites ready to add to your collection.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <Sparkles className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-stone-500">Loading your sparkle stash...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-dashed border-stone-300 bg-stone-50/50 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-50 text-rani mb-4 border border-pink-100">
            <Heart className="h-8 w-8 text-rani" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Your wishlist is empty</h3>
          <p className="mt-1 text-xs text-stone-500">
            Tap the heart icon on any jhumka, choker, necklace or combo to save it for later!
          </p>
          <Button asChild className="mt-6 rounded-full bg-stone-900 px-6 font-bold text-white hover:bg-black transition-all shadow-md">
            <Link href="/products">
              Explore Silver Drops <ArrowRight className="ml-1.5 h-4 w-4 text-amber-400" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={Number(product.price)}
              comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
              image={product.images?.[0]?.url}
              category={product.category}
              status={product.status}
              badge={product.badge}
              material={product.material}
              silverPurity={product.silverPurity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
