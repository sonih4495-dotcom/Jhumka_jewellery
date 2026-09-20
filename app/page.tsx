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
import { HeroMediaShowcase } from '@/components/hero-media-showcase';
import { getStoredHeroBanner } from '@/server/banner-data';
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

const SUPABASE_BUCKET_URL = 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

const SHOP_CATEGORIES = [
  {
    name: 'Chandbali Jhumkas',
    slug: 'chandbali-jhumkas',
    tagline: 'Royal Crescent Drops',
    image: `${SUPABASE_BUCKET_URL}/categories/chandbali-jhumkas.jpg?v=2`,
    emoji: '🌙',
  },
  {
    name: 'Temple Dome Jhumkas',
    slug: 'dome-temple-jhumkas',
    tagline: 'Melodic Ghungroo Chimes',
    image: `${SUPABASE_BUCKET_URL}/categories/dome-temple-jhumkas.jpg?v=2`,
    emoji: '🔔',
  },
  {
    name: 'Kashmiri & Afghan Jhumkas',
    slug: 'kashmiri-afghan-jhumkas',
    tagline: 'Tribal Mirrors & Coins',
    image: `${SUPABASE_BUCKET_URL}/categories/kashmiri-afghan-jhumkas.jpg?v=2`,
    emoji: '✨',
  },
  {
    name: 'Peacock & Floral Jhumkas',
    slug: 'peacock-floral-jhumkas',
    tagline: 'Twin Dome Handcrafted',
    image: `${SUPABASE_BUCKET_URL}/categories/peacock-floral-jhumkas.jpg?v=2`,
    emoji: '🦚',
  },
  {
    name: 'Mini Everyday Jhumkas',
    slug: 'mini-everyday-jhumkas',
    tagline: 'Lightweight College Wear',
    image: `${SUPABASE_BUCKET_URL}/categories/mini-everyday-jhumkas.jpg?v=2`,
    emoji: '🌸',
  },
  {
    name: 'Festive Jhumka Combos & Sets',
    slug: 'festive-jhumka-combos',
    tagline: 'Hasli Chokers & Boxes',
    image: `${SUPABASE_BUCKET_URL}/categories/festive-jhumka-combos.jpg?v=2`,
    emoji: '🎁',
  },
];

const CUSTOMER_REVIEWS = [
  {
    name: 'Ananya Deshmukh',
    city: 'Mumbai',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-ananya.jpg`,
    rating: 5,
    verified: true,
    review: 'Wore the Royal Chandbali oxidised jhumkas all 9 nights of Navratri! Zero irritation, super lightweight and got at least 20 compliments every night! 🌙✨',
    product: 'Royal Chandbali Oxidised Silver Jhumkas',
  },
  {
    name: 'Kashish Parekh',
    city: 'Ahmedabad',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-priya.jpg`,
    rating: 5,
    verified: true,
    review: 'The Kashmiri mirror-work tribal jhumkas are out of this world! They reflect light so gorgeously and are surprisingly lightweight. 🪞💖',
    product: 'Kashmiri Long Mirror-Work Tribal Jhumkas',
  },
  {
    name: 'Shreya Sengupta',
    city: 'Bengaluru',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-tanvi.jpg`,
    rating: 5,
    verified: true,
    review: 'Sent the Garba Queen Jumbo Jhumka Box to my sister. The packaging with velvet box is aesthetic and the jhumkas are huge yet comfortable! 👯‍♀️',
    product: 'Navratri Garba Queen Jumbo Jhumka Gift Combo',
  },
];

const VIBE_BACKGROUNDS: Record<string, string> = {
  'garba-glam': `${SUPABASE_BUCKET_URL}/vibes/garba-glam.jpg?v=2`,
  'minimal-daily': `${SUPABASE_BUCKET_URL}/vibes/minimal-daily.jpg?v=2`,
  'date-night': `${SUPABASE_BUCKET_URL}/vibes/date-night.jpg?v=2`,
  'evil-eye': `${SUPABASE_BUCKET_URL}/vibes/evil-eye.jpg?v=2`,
  'bestie-gifting': `${SUPABASE_BUCKET_URL}/vibes/bestie-gifting.jpg?v=2`,
};

async function FeaturedProductsSection() {
  let products: any[] = [];
  try {
    products = await getFeaturedProducts();
  } catch (err) {
    console.error('Failed to load featured products:', err);
  }

  if (!products || !products.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-xs text-stone-500">Curating the latest silver drops...</p>
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
  let products: any[] = [];
  try {
    products = await getNewProducts(8);
  } catch (err) {
    console.error('Failed to load new products:', err);
  }

  if (!products || !products.length) {
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
  const heroBanner = getStoredHeroBanner();

  return (
    <div
      className="space-y-16 sm:space-y-24"
      style={{ backgroundColor: '#FAF8F5' }}
    >

      {/* ── HERO SECTION: Full-Bleed Obsidian Canvas, Warm Gold & Rani Ambient Glow ── */}
      <section
        className="relative overflow-hidden text-white pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-amber-500/20"
        style={{ backgroundColor: '#141312' }}
      >
        {/* Ambient lighting mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(194,24,91,0.16),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.08),rgba(255,255,255,0))] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">

            {/* Hero Left Content */}
            <div className="text-center lg:text-left lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-white/10 backdrop-blur-xl px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-lg">
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
                Premium Handcrafted • Anti-Tarnish Finish
              </div>

              <h1 className="font-display text-3xl xs:text-4xl font-black tracking-tight sm:text-6xl md:text-7xl leading-[1.08] sm:leading-[1.06]">
                Drip in Statement <br className="hidden sm:inline" />
                <span className="text-gold-foil">
                  Jewellery ✨
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-xl text-xs sm:text-base text-stone-300 leading-relaxed font-sans font-normal">
                Handcrafted oxidised statement pieces, aesthetic stackable rings, and viral charm chains. Made for Dandiya nights, everyday college glow, and matching with your besties.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rani px-7 py-3.5 sm:px-8 sm:py-4 text-sm font-bold text-white shadow-xl shadow-rose-950/40 hover:scale-105 active:scale-95 transition-all border-0 text-center"
                >
                  Shop New Drops <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/category/combos"
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:text-white px-7 py-3.5 sm:px-8 sm:py-4 text-sm font-semibold transition-all text-center hover:scale-105 active:scale-95"
                >
                  Explore Gift Combos 🎁
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-4 pt-2 sm:pt-4 text-[11px] sm:text-xs text-stone-300">
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 backdrop-blur-md">
                  <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" /> Premium Quality Assured
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 backdrop-blur-md">
                  <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose-400" /> FREE Shipping — Always 🚚
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300" /> Cash on Delivery (COD)
                </span>
              </div>
            </div>

            {/* Hero Right Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <HeroMediaShowcase banner={heroBanner} />
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY VIBE: Large Editorial Visual Image Tiles ── */}
      <section className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rani/10 px-3 py-1 text-xs font-bold text-rani mb-2 border border-rani/20">
            <Sparkles className="h-3.5 w-3.5 text-rani" />
            Curated Aesthetics
          </div>
          <h2 className="font-display text-2xl font-black tracking-tight text-stone-900 sm:text-4xl">
            Shop by Vibe ✨
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-stone-500 font-sans">
            Whatever your mood today, we've got the matching silver sparkle.
          </p>
        </div>

        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 scrollbar-hide snap-x snap-mandatory">
          {JEWELLERY_VIBES.map(vibe => {
            const bgImage = VIBE_BACKGROUNDS[vibe.id] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80';
            return (
              <Link
                key={vibe.id}
                href={`/products?search=${encodeURIComponent(vibe.name)}`}
                className="group relative flex-none w-[70vw] sm:w-auto snap-center flex flex-col justify-end overflow-hidden rounded-2xl border border-stone-200/90 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-500/50 min-h-[250px] sm:min-h-[300px] p-4 sm:p-5"
              >
                {/* Background Image with Hover Zoom */}
                <Image
                  src={bgImage}
                  alt={vibe.name}
                  fill
                  sizes="(max-width: 640px) 70vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-stone-950/20 group-hover:via-stone-950/50 transition-all duration-300" />

                {/* Card Content on Top */}
                <div className="relative z-10 space-y-1.5 sm:space-y-2">
                  <span className="text-2xl sm:text-3xl block drop-shadow-md">{vibe.icon}</span>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors drop-shadow">
                    {vibe.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-300 leading-snug font-sans line-clamp-2">
                    {vibe.description}
                  </p>
                  <div className="pt-1.5 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-300 font-sans">
                    <span>Explore Vibe</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── SHOP CATEGORIES GRID: Silver Essentials ── */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end mb-8">
          <div>
            <h2 className="font-display text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              Silver Essentials 💍
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              Browse by handcrafted silver jewellery categories.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-rani hover:underline flex items-center gap-1"
          >
            View All Categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SHOP_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg hover:border-amber-500/40"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                <span className="absolute top-2 right-2 text-lg drop-shadow">{cat.emoji}</span>
              </div>
              <div className="p-3 text-center bg-white">
                <p className="font-sans text-xs font-bold text-stone-900 group-hover:text-rani truncate transition-colors">
                  {cat.name}
                </p>
                <p className="text-[10px] text-stone-500 truncate mt-0.5 font-sans">
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
              <span className="inline-flex items-center rounded-full bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
                👑 Most Loved
              </span>
            </div>
            <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              Bestseller Drops ✨
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              The most viral pieces loved by thousands of Gen Z besties across India.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-rani hover:underline flex items-center gap-1"
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
              <span className="inline-flex items-center rounded-full bg-rani text-white text-[10px] font-bold px-2.5 py-0.5 shadow-sm">
                ✨ Just Dropped
              </span>
            </div>
            <h2 className="font-display mt-1 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
              Fresh Arrivals 🌙
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-sans">
              Brand new handcrafted &amp; oxidised designs added this week.
            </p>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-xs font-bold text-rani hover:underline flex items-center gap-1"
          >
            See All New Drops →
          </Link>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <NewProductsSection />
        </Suspense>
      </section>

      {/* ── BESTIE REFERRAL BANNER: Jewel Gradient Mesh ── */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rani via-pink-700 to-stone-900 p-8 sm:p-10 text-white shadow-2xl border border-amber-400/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.2),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center rounded-full bg-white/20 text-white text-xs font-bold px-3 py-1 backdrop-blur-md border border-white/20">
              👯‍♀️ Bestie Squad Program
            </span>
            <h3 className="font-display text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Share the Drip with your Bestie! <br />
              Give 20%, Get ₹200 Voucher.
            </h3>
            <p className="text-xs sm:text-sm text-stone-200 font-sans leading-relaxed">
              Send your personal code to your friends. They get 20% off their first piece, and you get ₹200 to spend on your next ring or payal!
            </p>
            <div className="pt-2">
              <ReferralModal trigger={
                <Button size="lg" className="rounded-full bg-white font-bold text-stone-950 hover:bg-stone-100 shadow-xl border-0 hover:scale-105 active:scale-95 transition-all">
                  <Gift className="mr-2 h-4 w-4 text-rani" /> Share with Besties Now
                </Button>
              } />
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER REVIEWS: Luxury Editorial Cards ── */}
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-10 text-center max-w-xl mx-auto">
          <span className="inline-flex items-center rounded-full bg-rani/10 text-rani text-xs font-bold px-3 py-1 mb-2 border border-rani/20">
            💖 10,000+ Happy Besties
          </span>
          <h2 className="font-display text-2xl font-black tracking-tight text-stone-900 sm:text-3xl">
            What Gen Z is Saying About Jhumka Junction
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CUSTOMER_REVIEWS.map((rev, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber-500/30"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic font-sans">
                  "{rev.review}"
                </p>
                <p className="text-[11px] font-bold text-rani font-sans">
                  Tag: {rev.product}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-100 mt-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-stone-200">
                  <Image src={rev.avatar} alt={rev.name} fill sizes="40px" className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900 flex items-center gap-1">
                    {rev.name}
                    {rev.verified && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </p>
                  <p className="text-[10px] text-stone-400">{rev.city}, India • Verified Buyer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}