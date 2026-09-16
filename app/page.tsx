// Location: app/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Heart,
  Star,
  Gift,
  Ruler,
  TrendingUp,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductGrid } from '@/components/product-grid';
import { ProductCard } from '@/components/product-card';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { NewsletterForm } from '@/components/newsletter-form';
import { ReelsCarousel } from '@/components/reels-carousel';
import { ReferralModal } from '@/components/referral-modal';
import { RingSizeGuideModal } from '@/components/ring-size-guide-modal';
import { getFeaturedProducts, getNewProducts } from '@/server/queries/products';
import { JEWELLERY_VIBES } from '@/lib/utils';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Jhumka Junction | Trendy Oxidised & Fashion Jewellery for Gen Z',
  description:
    'Shop authentic handcrafted oxidised jhumkas, statement rings, chokers, anklets, and combos. Handcrafted jewellery crafted for Gen Z Indian women.',
  openGraph: {
    title: 'Jhumka Junction | Handcrafted Jewellery Store',
    description: 'Drip in statement oxidised jhumkas, rings, necklaces & anklets.',
    type: 'website',
  },
};

const SHOP_CATEGORIES = [
  {
    name: 'Statement Rings',
    slug: 'rings',
    tagline: 'Adjustable & Stackable',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&auto=format&fit=crop&q=80',
    emoji: '💍',
  },
  {
    name: 'Oxidised Jhumkas & Studs',
    slug: 'earrings',
    tagline: 'Festive & College Glow',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80',
    emoji: '✨',
  },
  {
    name: 'Necklaces & Chokers',
    slug: 'necklaces',
    tagline: 'Layered & Evil Eye Chains',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    emoji: '📿',
  },
  {
    name: 'Ghungroo Payal (Anklets)',
    slug: 'anklets',
    tagline: 'Tribal Chimes & Daily Payal',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    emoji: '🔔',
  },
  {
    name: 'Tennis & Charm Bracelets',
    slug: 'bracelets',
    tagline: 'Pure Sterling Sparkle',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&auto=format&fit=crop&q=80',
    emoji: '💫',
  },
  {
    name: 'Festive Gift Combos',
    slug: 'combos',
    tagline: 'Bestie & Navratri Sets',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    emoji: '🎁',
  },
];

const CUSTOMER_REVIEWS = [
  {
    name: 'Ananya Deshmukh',
    city: 'Mumbai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    verified: true,
    review: 'Wore the Chandbali oxidised jhumkas all 9 nights of Navratri! Zero irritation, super lightweight and got at least 20 compliments every night! 🌙✨',
    product: 'Chandbali Oxidised Silver Jhumkas',
  },
  {
    name: 'Kashish Parekh',
    city: 'Ahmedabad',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    verified: true,
    review: 'The oxidised adjustable ring is stunning! Looks so unique and aesthetic, and since it is adjustable it fits both my index and ring finger perfectly. 💖',
    product: 'Dainty Oxidised Adjustable Statement Ring',
  },
  {
    name: 'Shreya Sengupta',
    city: 'Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    rating: 5,
    verified: true,
    review: 'Sent the Bestie Gift Box to my college roommate. The packaging is aesthetic with an authenticity certificate card. COD delivery was super fast! 👯‍♀️',
    product: 'Garba Queen Festive Gift Combo',
  },
];

async function FeaturedProductsSection() {
  const products = await getFeaturedProducts();

  if (!products.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs text-gray-500">Curating the latest silver drops...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product: any) => (
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
          badge={product.badge || 'BESTSELLER'}
          material={product.material}
          silverPurity={product.silverPurity}
        />
      ))}
    </div>
  );
}

async function NewProductsSection() {
  const products = await getNewProducts(8);

  if (!products.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product: any) => (
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
          badge={product.badge || 'NEW_DROP'}
          material={product.material}
          silverPurity={product.silverPurity}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 bg-[#FAFAFA]">

      {/* ── HERO SECTION: Sleek Charcoal, Warm Glow, High-End Contrast ── */}
      <section className="relative overflow-hidden bg-[#111113] text-white pt-16 pb-20 sm:pt-24 sm:pb-32">
        {/* Subtle warm glow background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.12),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(225,29,72,0.12),transparent_40%)]" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">

            {/* Hero Left Content */}
            <div className="text-center lg:text-left lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                Premium Handcrafted • Anti-Tarnish Finish
              </div>

              <h1 className="font-display text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.08]">
                Drip in Statement <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-amber-400">
                  Jewellery ✨
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-sm sm:text-base text-gray-300 leading-relaxed font-sans">
                Handcrafted oxidised statement pieces, aesthetic stackable rings, and viral charm chains. Made for Dandiya nights, everyday college glow, and matching with your besties.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-rose-600/30 hover:from-rose-500 hover:to-pink-500 transition-all border-0 text-center"
                >
                  Shop New Drops <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/category/combos"
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white/10 hover:text-white px-8 py-4 text-sm font-semibold transition-all text-center"
                >
                  Explore Gift Combos 🎁
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-400" /> Premium Quality Assured
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-rose-400" /> FREE Shipping — Always 🚚
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" /> Cash on Delivery (COD)
                </span>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl border border-white/15 bg-white/5 p-3 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"
                    alt="Jhumka Junction Handcrafted Jewellery"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <Badge className="bg-rose-600 text-white text-[10px] font-bold mb-1 border-0">
                      🔥 Navratri Bestseller
                    </Badge>
                    <p className="font-display font-bold text-sm text-white">Chandbali Oxidised Jhumkas</p>
                    <p className="text-xs text-amber-300 font-extrabold mt-0.5">₹1,199 <span className="line-through text-gray-400 font-normal">₹1,999</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY VIBE ── */}
      <section className="container mx-auto px-4">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 mb-2 border border-rose-100">
            <Sparkles className="h-3.5 w-3.5 text-rose-600" />
            Curated Aesthetics
          </div>
          <h2 className="font-display text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            Shop by Vibe ✨
          </h2>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            Whatever your mood today, we've got the matching silver sparkle.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {JEWELLERY_VIBES.map(vibe => (
            <Link
              key={vibe.id}
              href={`/products?search=${encodeURIComponent(vibe.name)}`}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-400 hover:shadow-lg"
            >
              <div>
                <span className="text-3xl mb-3 block">{vibe.icon}</span>
                <h3 className="font-display text-base font-bold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {vibe.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500 leading-snug font-sans">
                  {vibe.description}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600 font-sans">
                <span>Explore Vibe</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SHOP CATEGORIES GRID ── */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end mb-8">
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Silver Essentials 💍
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-sans">
              Browse by handcrafted silver jewellery categories.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-gray-300"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2 right-2 text-lg">{cat.emoji}</span>
              </div>
              <div className="p-3 text-center">
                <p className="font-sans text-xs font-bold text-gray-900 group-hover:text-rose-600 truncate transition-colors">
                  {cat.name}
                </p>
                <p className="text-[10px] text-gray-500 truncate mt-0.5 font-sans">
                  {cat.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end mb-8">
          <div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-0">
                👑 Most Loved
              </Badge>
            </div>
            <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Bestseller Drops ✨
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-sans">
              The most viral pieces loved by thousands of Gen Z besties across India.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            Explore All Drops →
          </Link>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <FeaturedProductsSection />
        </Suspense>
      </section>

      {/* ── INSTAGRAM REELS CAROUSEL ── */}
      <ReelsCarousel />

      {/* ── NEW DROPS ── */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end mb-8">
          <div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-0">
                ✨ Just Dropped
              </Badge>
            </div>
            <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Fresh Arrivals 🌙
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-sans">
              Brand new handcrafted &amp; oxidised designs added this week.
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            See All New Drops →
          </Link>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <NewProductsSection />
        </Suspense>
      </section>

      {/* ── BESTIE REFERRAL BANNER ── */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-700 p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <Badge className="bg-white/20 text-white text-xs backdrop-blur-md border-0">
              👯‍♀️ Bestie Squad Program
            </Badge>
            <h3 className="font-display text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Share the Drip with your Bestie! <br />
              Give 20%, Get ₹200 Voucher.
            </h3>
            <p className="text-xs sm:text-sm text-white/90 font-sans">
              Send your personal code to your friends. They get 20% off their first piece, and you get ₹200 to spend on your next ring or payal!
            </p>
            <div className="pt-2">
              <ReferralModal trigger={
                <Button size="lg" className="rounded-full bg-white font-bold text-rose-950 hover:bg-gray-100 shadow-md border-0">
                  <Gift className="mr-2 h-4 w-4 text-rose-600" /> Share with Besties Now
                </Button>
              } />
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS ── */}
      <section className="container mx-auto px-4">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <Badge className="bg-rose-50 text-rose-700 text-xs mb-2 border border-rose-200">💖 10,000+ Happy Besties</Badge>
          <h2 className="font-display text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            What Gen Z is Saying About Jhumka Junction
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CUSTOMER_REVIEWS.map((rev, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed italic font-sans">
                  "{rev.review}"
                </p>
                <p className="text-[11px] font-bold text-rose-600 font-sans">
                  Tag: {rev.product}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200">
                  <Image src={rev.avatar} alt={rev.name} fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    {rev.name}
                    {rev.verified && <ShieldCheck className="h-3 w-3 text-emerald-600" />}
                  </p>
                  <p className="text-[10px] text-gray-400">{rev.city}, India • Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}