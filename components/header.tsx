// Location: components/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { Menu, Search, User, Heart, Sparkles, ChevronDown, ShoppingBag } from 'lucide-react';
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
import { useCart } from '@/components/cart-provider';
import dynamic from 'next/dynamic';

const ReferralModal = dynamic(
  () => import('@/components/referral-modal').then(mod => mod.ReferralModal),
  { ssr: false }
);

const RingSizeGuideModal = dynamic(
  () => import('@/components/ring-size-guide-modal').then(mod => mod.RingSizeGuideModal),
  { ssr: false }
);

const SUPABASE_BUCKET_URL = 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

const categories = [
  {
    href: '/category/chandbali-jhumkas',
    label: 'Chandbali Jhumkas',
    emoji: '🌙',
    tagline: 'Royal Crescent Drops',
    image: `${SUPABASE_BUCKET_URL}/categories/chandbali-jhumkas.jpg`,
  },
  {
    href: '/category/dome-temple-jhumkas',
    label: 'Temple Dome Jhumkas',
    emoji: '🔔',
    tagline: 'Melodic Ghungroo Chimes',
    image: `${SUPABASE_BUCKET_URL}/categories/dome-temple-jhumkas.jpg`,
  },
  {
    href: '/category/kashmiri-afghan-jhumkas',
    label: 'Kashmiri & Afghan',
    emoji: '✨',
    tagline: 'Tribal Mirrors & Coins',
    image: `${SUPABASE_BUCKET_URL}/categories/kashmiri-afghan-jhumkas.jpg`,
  },
  {
    href: '/category/peacock-floral-jhumkas',
    label: 'Peacock Filigree',
    emoji: '🦚',
    tagline: 'Twin Dome Handcrafted',
    image: `${SUPABASE_BUCKET_URL}/categories/peacock-floral-jhumkas.jpg`,
  },
  {
    href: '/category/mini-everyday-jhumkas',
    label: 'Mini Daily Drops',
    emoji: '🌸',
    tagline: 'Lightweight College Wear',
    image: `${SUPABASE_BUCKET_URL}/categories/mini-everyday-jhumkas.jpg`,
  },
  {
    href: '/category/festive-jhumka-combos',
    label: 'Jhumka Sets & Combos',
    emoji: '🎁',
    tagline: 'Hasli Chokers & Gift Sets',
    image: `${SUPABASE_BUCKET_URL}/categories/festive-jhumka-combos.jpg`,
  },
];

export function Header() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { wishlistCount } = useWishlist();
  const { totalItems: cartCount } = useCart();

  return (
    <>
      {/* ── Marquee Announcement Bar ── */}
      <div
        className="border-b border-amber-500/20 py-2.5 text-xs font-medium text-stone-200 overflow-hidden relative select-none"
        style={{ backgroundColor: '#161514', color: '#f5f5f4' }}
      >
        <div className="flex w-max animate-marquee gap-10 items-center whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-10">
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold tracking-wide">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Navratri &amp; Festive Drop Live ✨
              </span>
              <span className="text-stone-300">
                Use Code <strong className="rounded-md bg-white/10 border border-amber-400/30 px-2 py-0.5 font-mono text-amber-300 font-bold">DRIP10</strong> for 10% OFF
              </span>
              <span className="text-stone-300">
                FREE Shipping on ALL orders — always! 🚚✨
              </span>
              <span className="text-stone-300 hidden sm:inline">
                🛡️ 100% Anti-Tarnish • Skin-Safe Oxidised Silver
              </span>
              <span className="text-stone-300 hidden md:inline">
                👯‍♀️ Bestie Referral: Give 20%, Get ₹200 Voucher
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Boutique Sticky Header ── */}
      <header
        className="sticky top-0 z-40 border-b border-stone-200/80 backdrop-blur-xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] transition-all"
        style={{ backgroundColor: 'rgba(250, 248, 245, 0.95)' }}
      >
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:py-3.5">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-stone-200 shadow-sm transition-transform duration-300 group-hover:scale-105 bg-white">
              <Image src="/images/logo.png" alt="Jhumka Junction Logo" fill priority sizes="40px" className="object-cover" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-sans">
                Jhumka<span className="text-rani">Junction</span>
              </span>
              <p className="hidden xs:block text-[9px] font-bold uppercase tracking-widest text-stone-500 font-sans">
                Boutique Oxidised &amp; Handcrafted Jewellery
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-wider text-stone-900 hover:text-rani transition-colors"
            >
              All Drops
            </Link>

            {/* Categories Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoryMenuOpen(true)}
              onMouseLeave={() => setIsCategoryMenuOpen(false)}
            >
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-rani transition-colors py-2"
                onClick={() => setIsCategoryMenuOpen(prev => !prev)}
              >
                Categories
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180 text-rani' : 'text-stone-400'}`} />
              </button>

              {/* Mega-menu dropdown panel */}
              {isCategoryMenuOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50"
                  style={{ width: '620px', maxWidth: '90vw' }}
                >
                  <div className="rounded-2xl border border-stone-200/90 bg-white/95 backdrop-blur-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
                    <div className="mb-3 flex items-center justify-between border-b border-stone-200/70 pb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        Explore by Category
                      </span>
                      <Link
                        href="/products"
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="text-xs font-bold text-rani hover:underline"
                      >
                        View Full Collection →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {categories.map(cat => (
                        <Link
                          key={cat.href}
                          href={cat.href}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="group flex items-center gap-3 rounded-xl border border-stone-200/70 bg-stone-50/70 p-3 transition-all duration-200 hover:bg-white hover:border-rani/40 hover:shadow-md"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-stone-200/80 shadow-xs text-xl group-hover:scale-110 transition-transform">
                            {cat.emoji}
                          </span>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold text-stone-900 group-hover:text-rani transition-colors truncate">
                              {cat.label}
                            </p>
                            <p className="text-[10px] text-stone-500 truncate mt-0.5">
                              {cat.tagline}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/category/combos"
              className="text-xs font-bold uppercase tracking-wider text-stone-700 hover:text-rani transition-colors"
            >
              Festive Combos 🎁
            </Link>

            <RingSizeGuideModal />

            <div className="hidden xl:block">
              <ReferralModal />
            </div>

            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin/products"
                className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white hover:bg-black transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-stone-800 hover:text-[#BE185D] hover:bg-stone-200/70 transition-colors"
            >
              <Link href="/search" aria-label="Search Jewellery">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            {/* Wishlist / Liked Button */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full text-stone-800 hover:text-[#BE185D] hover:bg-stone-200/70 transition-transform active:scale-95"
            >
              <Link href="/wishlist" aria-label="Wishlist" data-testid="header-wishlist-button">
                <Heart className={`h-4 w-4 transition-colors ${wishlistCount > 0 ? 'fill-[#BE185D] text-[#BE185D] stroke-[2.2]' : 'text-stone-800'}`} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex h-4 min-w-[18px] px-1 items-center justify-center rounded-full text-[9px] font-black shadow-md ring-2 ring-[#FAF8F5] animate-in zoom-in-50 duration-200"
                    style={{ backgroundColor: '#BE185D', color: '#ffffff' }}
                  >
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Shopping Bag / Cart Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative h-9 w-9 rounded-full text-stone-800 hover:text-stone-950 hover:bg-stone-200/70 transition-transform active:scale-95"
              aria-label="Shopping Bag"
              data-testid="header-cart-button"
            >
              <ShoppingBag className={`h-4 w-4 transition-colors ${cartCount > 0 ? 'text-stone-900 stroke-[2.4]' : 'text-stone-800'}`} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 min-w-[18px] px-1 items-center justify-center rounded-full font-black text-[9px] shadow-md border border-amber-400/50 ring-2 ring-[#FAF8F5] animate-in zoom-in-50 duration-200"
                  style={{ backgroundColor: '#181716', color: '#FCD34D' }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>

            {/* Cart Drawer controlled by Header button */}
            <CartDrawer open={isCartDrawerOpen} onOpenChange={setIsCartDrawerOpen} />

            {session?.user ? (
              <div className="hidden items-center gap-1 sm:flex">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-stone-800 hover:text-[#BE185D] hover:bg-stone-200/70"
                >
                  <Link href="/profile" aria-label="My Account">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-xs text-stone-700 hover:text-stone-950 font-semibold"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden sm:inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
                style={{ backgroundColor: '#181716', color: '#ffffff' }}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Navigation Drawer */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-10 w-10 rounded-full hover:bg-stone-200/50 active:scale-95"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-stone-800" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[88vw] max-w-[360px] p-5 sm:p-6 bg-[#FAF8F5] border-l border-stone-200 overflow-y-auto pb-safe">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2 text-xl font-black text-stone-900 font-sans">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Jhumka Junction
                  </SheetTitle>
                  <p className="text-xs text-stone-500">Handcrafted Jewellery for Gen Z</p>
                </SheetHeader>

                {/* Mobile Search Bar in Drawer */}
                <form
                  action="/search"
                  method="GET"
                  onSubmit={() => setIsMobileMenuOpen(false)}
                  className="relative mt-4"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Search jhumkas, rings, sets..."
                    className="w-full rounded-xl bg-white border border-stone-200 pl-9 pr-4 py-2.5 text-xs font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-xs"
                  />
                </form>

                <div className="mt-4 flex flex-col gap-3">
                  <div className="rounded-2xl bg-amber-500/10 p-3.5 border border-amber-400/30">
                    <p className="text-[11px] font-bold text-amber-900">✨ Bestie Referral Program</p>
                    <p className="text-[10px] text-amber-800/80 mt-0.5">Share with your friends and get ₹200 off!</p>
                    <div className="mt-2.5">
                      <ReferralModal />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-xl p-2.5 bg-white border border-stone-200/80 text-xs font-bold text-stone-800 hover:border-rani shadow-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <Heart className={`h-3.5 w-3.5 ${wishlistCount > 0 ? 'text-rani fill-rani' : 'text-stone-500'}`} /> Liked
                      </span>
                      {wishlistCount > 0 && (
                        <span className="rounded-full bg-rani px-1.5 py-0.5 text-[9px] font-black text-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCartDrawerOpen(true);
                      }}
                      className="flex items-center justify-between rounded-xl p-2.5 bg-white border border-stone-200/80 text-xs font-bold text-stone-800 hover:border-amber-400 shadow-xs"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="h-3.5 w-3.5 text-amber-600" /> My Bag
                      </span>
                      {cartCount > 0 && (
                        <span className="rounded-full bg-stone-900 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 text-[9px] font-black">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mt-2">Categories</p>
                  <Link
                    href="/products"
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-stone-900 bg-white/70 border border-stone-200/60 hover:bg-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>All Silver Drops</span>
                    <span className="text-xs text-rani font-bold">Explore →</span>
                  </Link>

                  {categories.map(cat => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-white hover:text-rani transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>{cat.label} {cat.emoji}</span>
                      <span className="text-[10px] text-stone-400">{cat.tagline}</span>
                    </Link>
                  ))}

                  <div className="pt-2">
                    <RingSizeGuideModal />
                  </div>

                  <div className="border-t border-stone-200 pt-4 mt-2">
                    {session?.user ? (
                      <div className="space-y-2">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-stone-700 hover:bg-white"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" /> My Profile &amp; Orders
                        </Link>
                        {session.user.role === 'ADMIN' && (
                          <Link
                            href="/admin/products"
                            className="flex items-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-sm font-bold text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
                          className="w-full text-xs border-stone-300 text-stone-700"
                        >
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button asChild className="w-full rounded-xl bg-stone-900 text-xs font-bold text-white hover:bg-stone-800">
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