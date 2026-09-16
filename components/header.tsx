// Location: components/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Search, User, Heart, Sparkles, ShoppingBag, ShieldCheck, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CartDrawer } from '@/components/cart-drawer';
import { useWishlist } from '@/components/wishlist-provider';
import dynamic from 'next/dynamic';

const ReferralModal = dynamic(
  () => import('@/components/referral-modal').then(mod => mod.ReferralModal),
  { ssr: false }
);

const RingSizeGuideModal = dynamic(
  () => import('@/components/ring-size-guide-modal').then(mod => mod.RingSizeGuideModal),
  { ssr: false }
);

const categories = [
  { href: '/category/rings', label: 'Rings 💍' },
  { href: '/category/earrings', label: 'Earrings & Jhumkas ✨' },
  { href: '/category/necklaces', label: 'Necklaces & Chokers 📿' },
  { href: '/category/anklets', label: 'Anklets (Payal) 🔔' },
  { href: '/category/bracelets', label: 'Bracelets & Bangles 💫' },
  { href: '/category/combos', label: 'Festive Combos 🎁' },
];

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { wishlistCount } = useWishlist();

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#121214] border-b border-white/10 py-2 px-4 text-center text-xs font-medium text-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-amber-400 font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Navratri &amp; Festive Drop Live
          </span>
          <span className="mx-auto sm:mx-0 text-gray-300">
            Use Code <strong className="rounded bg-white/10 border border-white/15 px-2 py-0.5 font-mono text-amber-300 font-bold">DRIP10</strong> for 10% OFF | FREE Shipping on ALL orders — always! 🚚✨
          </span>
          <div className="hidden md:flex items-center gap-2">
            <ReferralModal />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(0,0,0,0.03)] transition-all">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:py-3.5">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-transform group-hover:scale-105">
              <Image src="/images/logo.png" alt="Jhumka Junction Logo" fill priority sizes="40px" className="object-cover" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 font-sans">
                Jhumka<span className="text-rose-600">Junction</span>
              </span>
              <p className="hidden xs:block text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Oxidised &amp; Fashion Jewellery • Handcrafted
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/products" className="text-xs font-bold text-gray-900 hover:text-rose-600 transition-colors">
              All Drops
            </Link>
            {categories.slice(0, 5).map(cat => (
              <Link
                key={cat.href}
                href={cat.href}
                className="text-xs font-semibold text-gray-700 hover:text-rose-600 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
            <RingSizeGuideModal />
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin/products"
                className="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white hover:bg-black"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-700 hover:text-rose-600 hover:bg-gray-100">
              <Link href="/search" aria-label="Search Jewellery">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <Button asChild variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-gray-700 hover:text-rose-600 hover:bg-gray-100">
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            <CartDrawer />

            {session?.user ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full text-gray-700 hover:text-rose-600 hover:bg-gray-100">
                  <Link href="/profile" aria-label="My Account">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex rounded-full bg-gray-900 text-xs font-bold text-white hover:bg-black px-4 py-2 shadow-sm border-0">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-full hover:bg-gray-100" aria-label="Open menu">
                  <Menu className="h-5 w-5 text-gray-800" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px] p-6 bg-white border-l border-gray-200">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2 text-xl font-black text-gray-900 font-sans">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Jhumka Junction
                  </SheetTitle>
                  <p className="text-xs text-gray-500">Handcrafted Jewellery for Gen Z</p>
                </SheetHeader>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="rounded-2xl bg-amber-50/70 p-3 border border-amber-200/60">
                    <p className="text-[11px] font-bold text-amber-900">✨ Bestie Referral Program</p>
                    <p className="text-[10px] text-amber-800/80 mt-0.5">Share with your friends and get ₹200 off!</p>
                    <div className="mt-2">
                      <ReferralModal />
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-2">Categories</p>
                  <Link
                    href="/products"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>All Silver Drops</span>
                    <span className="text-xs text-rose-600 font-bold">Explore →</span>
                  </Link>

                  {categories.map(cat => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-rose-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {cat.label}
                    </Link>
                  ))}

                  <div className="pt-2">
                    <RingSizeGuideModal />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-2">
                    {session?.user ? (
                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" /> My Profile &amp; Orders
                        </Link>
                        {session.user.role === 'ADMIN' && (
                          <Link
                            href="/admin/products"
                            className="flex items-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-sm font-bold text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                          className="w-full text-xs border-gray-300 text-gray-700"
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full rounded-xl bg-gray-900 text-xs font-bold text-white hover:bg-black">
                        <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                          Sign In / Register
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}