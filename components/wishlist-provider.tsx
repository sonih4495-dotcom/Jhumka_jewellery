// Location: components/wishlist-provider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
  wishlistCount: 0,
});

const WISHLIST_STORAGE_KEY = 'jhumka_junction_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage on client mount immediately
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setWishlistIds(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Sync with server DB if logged in (DB is single source of truth for authenticated user)
    fetch('/api/wishlist')
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (!data) return;
        if (data.guest === false && Array.isArray(data.wishlist)) {
          const apiIds = data.wishlist
            .map((item: any) => item.productId)
            .filter(Boolean);
          setWishlistIds(apiIds);
          try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(apiIds));
          } catch {}
        }
      })
      .catch(() => {});

    // Listen to cross-window storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setWishlistIds(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    const isAlreadyIn = wishlistIds.includes(productId);
    const next = isAlreadyIn
      ? wishlistIds.filter(id => id !== productId)
      : [...wishlistIds, productId];

    setWishlistIds(next);

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));
    } catch {}

    if (isAlreadyIn) {
      toast('Removed from Wishlist', { icon: '💔', id: `wishlist-${productId}`, duration: 1500 });
    } else {
      toast.success('Saved to Wishlist ❤️', { id: `wishlist-${productId}`, duration: 1500 });
    }

    window.dispatchEvent(new Event('wishlist-updated'));

    // Non-blocking fire-and-forget sync to backend
    fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }).catch(e => console.warn('Background wishlist sync:', e));
  }, [wishlistIds]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

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
