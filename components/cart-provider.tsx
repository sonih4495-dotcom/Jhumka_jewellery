'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { addToCart as serverAddToCart, updateCartItem as serverUpdateCartItem, removeFromCart as serverRemoveFromCart, getCart as serverGetCart } from '@/server/actions/cart';
import { toast } from 'react-hot-toast';

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: Array<{ url: string; altText?: string | null }>;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: CartItemProduct;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: any) => void;
  addToCart: (productId: string, quantity?: number, productData?: Partial<CartItemProduct>) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
  removeItem: (itemIdOrProductId: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (itemIdOrProductId: string, quantity: number) => void;
  updateItem: (id: string, quantity: number) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  total: number;
  totalAmount: number;
  totalItems: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'jj_cart_v2';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Initial Load: instant from localStorage, then background sync with server
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Could not read cart from localStorage:', e);
    }
    setIsLoaded(true);

    // Background sync with server cart session
    serverGetCart()
      .then(serverCart => {
        if (serverCart && serverCart.items && serverCart.items.length > 0) {
          const formatted: CartItem[] = serverCart.items.map((it: any) => ({
            id: it.id,
            productId: it.product.id,
            quantity: it.quantity,
            price: Number(it.product.price),
            product: {
              id: it.product.id,
              name: it.product.name,
              slug: it.product.slug,
              price: Number(it.product.price),
              comparePrice: it.product.comparePrice ? Number(it.product.comparePrice) : null,
              images: it.product.images || [{ url: '/images/placeholder.svg' }],
            },
          }));
          setItems(formatted);
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(formatted));
        }
      })
      .catch(err => {
        // Silently catch server connection errors in background
        console.warn('Server cart sync deferred:', err);
      });
  }, []);

  // Save changes to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save cart to localStorage:', e);
      }
    }
  }, [items, isLoaded]);

  // Fast helper to check quantity of any product in cart
  const getItemQuantity = useCallback((productId: string): number => {
    const item = items.find(
      i => i.productId === productId || i.product?.id === productId || i.id === productId
    );
    return item ? item.quantity : 0;
  }, [items]);

  // Optimistic Instant Add to Cart (0ms latency)
  const addToCart = useCallback((productId: string, quantityToAdd = 1, productData?: Partial<CartItemProduct>) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.productId === productId || i.product?.id === productId
      );

      if (existing) {
        return prev.map(item => {
          if (item.productId === productId || item.product?.id === productId) {
            return {
              ...item,
              quantity: item.quantity + quantityToAdd,
            };
          }
          return item;
        });
      }

      const newItem: CartItem = {
        id: `local_${productId}_${Date.now()}`,
        productId,
        quantity: quantityToAdd,
        price: productData?.price || 0,
        product: {
          id: productId,
          name: productData?.name || 'Handcrafted Jewellery Piece',
          slug: productData?.slug || productId,
          price: productData?.price || 0,
          comparePrice: productData?.comparePrice || null,
          images: productData?.images?.length ? productData.images : [{ url: '/images/placeholder.svg', altText: null }],
        },
      };
      return [...prev, newItem];
    });

    toast.success('Added to Bag ✨', { id: `added-${productId}`, duration: 1800 });
    window.dispatchEvent(new Event('cart-updated'));

    // Fire server action in the background (never blocks UI)
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('quantity', quantityToAdd.toString());

    serverAddToCart(formData)
      .then(res => {
        if (!res.success) {
          console.warn('Background server add-to-cart notice:', res.error);
        }
      })
      .catch(err => {
        console.warn('Background server add-to-cart error:', err);
      });
  }, []);

  // Optimistic Increment
  const incrementQuantity = useCallback((productId: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.productId === productId || item.product?.id === productId || item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );

    window.dispatchEvent(new Event('cart-updated'));

    // Server update in background
    const existing = items.find(
      i => i.productId === productId || i.product?.id === productId || i.id === productId
    );
    if (existing && !existing.id.startsWith('local_')) {
      const formData = new FormData();
      formData.append('quantity', (existing.quantity + 1).toString());
      serverUpdateCartItem(existing.id, formData).catch(e => console.warn('Background update:', e));
    } else {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('quantity', '1');
      serverAddToCart(formData).catch(e => console.warn('Background add:', e));
    }
  }, [items]);

  // Optimistic Decrement
  const decrementQuantity = useCallback((productId: string) => {
    const existing = items.find(
      i => i.productId === productId || i.product?.id === productId || i.id === productId
    );
    if (!existing) return;

    if (existing.quantity <= 1) {
      // Remove completely
      setItems(prev =>
        prev.filter(
          i => i.productId !== productId && i.product?.id !== productId && i.id !== productId
        )
      );
      toast('Removed from Bag', { icon: '🗑️', duration: 1500 });
      window.dispatchEvent(new Event('cart-updated'));

      if (!existing.id.startsWith('local_')) {
        const formData = new FormData();
        formData.append('productId', existing.productId);
        serverRemoveFromCart(formData).catch(e => console.warn('Background remove:', e));
      }
    } else {
      // Decrement by 1
      setItems(prev =>
        prev.map(item => {
          if (item.productId === productId || item.product?.id === productId || item.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
      );
      window.dispatchEvent(new Event('cart-updated'));

      if (!existing.id.startsWith('local_')) {
        const formData = new FormData();
        formData.append('quantity', (existing.quantity - 1).toString());
        serverUpdateCartItem(existing.id, formData).catch(e => console.warn('Background update:', e));
      }
    }
  }, [items]);

  // Remove Item
  const removeItem = useCallback((itemIdOrProductId: string) => {
    const itemToRemove = items.find(
      i => i.id === itemIdOrProductId || i.productId === itemIdOrProductId || i.product?.id === itemIdOrProductId
    );

    setItems(prev =>
      prev.filter(
        i => i.id !== itemIdOrProductId && i.productId !== itemIdOrProductId && i.product?.id !== itemIdOrProductId
      )
    );
    window.dispatchEvent(new Event('cart-updated'));

    if (itemToRemove && !itemToRemove.id.startsWith('local_')) {
      const formData = new FormData();
      formData.append('productId', itemToRemove.productId);
      serverRemoveFromCart(formData).catch(e => console.warn('Background remove:', e));
    }
  }, [items]);

  const updateQuantity = useCallback((itemIdOrProductId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemIdOrProductId);
      return;
    }

    setItems(prev =>
      prev.map(i => {
        if (i.id === itemIdOrProductId || i.productId === itemIdOrProductId || i.product?.id === itemIdOrProductId) {
          return { ...i, quantity: newQuantity };
        }
        return i;
      })
    );
    window.dispatchEvent(new Event('cart-updated'));

    const item = items.find(
      i => i.id === itemIdOrProductId || i.productId === itemIdOrProductId || i.product?.id === itemIdOrProductId
    );
    if (item && !item.id.startsWith('local_')) {
      const formData = new FormData();
      formData.append('quantity', newQuantity.toString());
      serverUpdateCartItem(item.id, formData).catch(e => console.warn('Background update:', e));
    }
  }, [items, removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {}
    window.dispatchEvent(new Event('cart-updated'));
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem: (it: any) => addToCart(it.productId, it.quantity, it.product),
        addToCart,
        incrementQuantity,
        decrementQuantity,
        removeItem,
        removeFromCart: removeItem,
        updateQuantity,
        updateItem: updateQuantity,
        getItemQuantity,
        clearCart,
        total,
        totalAmount: total,
        totalItems,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

