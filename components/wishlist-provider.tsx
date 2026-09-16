// Location: components/wishlist-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage on client mount
    try {
      const saved = localStorage.getItem('jhumka_junction_wishlist');
      if (saved) {
        setWishlistIds(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }

    // Attempt to sync with API if logged in
    fetch('/api/wishlist')
      .then(res => res.json())
      .then(data => {
        if (data.wishlist && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
          const apiIds = data.wishlist.map((item: any) => item.productId);
          setWishlistIds(prev => Array.from(new Set([...prev, ...apiIds])));
        }
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = async (productId: string) => {
    setWishlistIds(prev => {
      const next = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      try {
        localStorage.setItem('jhumka_junction_wishlist', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Notify backend
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // Non-blocking
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        wishlistCount: mounted ? wishlistIds.length : 0,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
