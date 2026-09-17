// File: app/layout.tsx
import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Toaster } from '@/components/ui/toaster';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});


export const metadata: Metadata = {
  title: {
    default: 'NextJS E-commerce Store',
    template: '%s | NextJS E-commerce',
  },
  description: 'Modern e-commerce store built with Next.js, Prisma, and Stripe',
  keywords: ['ecommerce', 'nextjs', 'store', 'shopping'],
  authors: [{ name: 'NextJS E-commerce' }],
  creator: 'NextJS E-commerce',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'NextJS E-commerce Store',
    description: 'Modern e-commerce store built with Next.js',
    siteName: 'NextJS E-commerce',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextJS E-commerce Store',
    description: 'Modern e-commerce store built with Next.js',
    creator: '@nextjsecommerce',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className={`${dmSans.className} antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
