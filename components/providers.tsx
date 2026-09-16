'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/components/cart-provider';
import { WishlistProvider } from '@/components/wishlist-provider';
import { WhatsAppButton } from '@/components/whatsapp-button';

interface ProvidersProps {
  children: React.ReactNode;
  session?: any;
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <WishlistProvider>
          {children}
          <WhatsAppButton />
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}
