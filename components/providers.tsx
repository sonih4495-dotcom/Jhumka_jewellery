'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/components/cart-provider';
import { WishlistProvider } from '@/components/wishlist-provider';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { Toaster as HotToaster } from 'react-hot-toast';

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
          <HotToaster
            position="bottom-center"
            toastOptions={{
              duration: 1800,
              style: {
                background: '#161514',
                color: '#ffffff',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '9999px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '700',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
              },
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#161514',
              },
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </SessionProvider>
  );
}
