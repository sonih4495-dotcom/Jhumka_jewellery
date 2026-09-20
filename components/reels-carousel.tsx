// Location: components/reels-carousel.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Heart, Instagram, ShoppingBag, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface ReelItem {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  thumbnail: string;
  title: string;
  likes: string;
  taggedProduct: {
    name: string;
    price: number;
    slug: string;
  };
}

const SUPABASE_BUCKET_URL = 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

const REELS: ReelItem[] = [
  {
    id: '1',
    creator: 'Ananya Sharma',
    handle: '@ananya.glam',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-ananya.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/garba-glam.jpg`,
    title: 'Garba night styling with Royal Chandbali jhumkas! 🌙✨',
    likes: '14.2K',
    taggedProduct: {
      name: 'Royal Chandbali Oxidised Silver Jhumkas',
      price: 1299,
      slug: 'royal-chandbali-oxidised-jhumkas',
    },
  },
  {
    id: '2',
    creator: 'Riya Mehta',
    handle: '@riya_drips',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-priya.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/date-night.jpg`,
    title: 'Twin dome peacock jhumkas for ethnic festive dates! 🦚✨',
    likes: '28.9K',
    taggedProduct: {
      name: 'Peacock Filigree Dual Dome Jhumkas',
      price: 1499,
      slug: 'peacock-filigree-dual-dome-jhumkas',
    },
  },
  {
    id: '3',
    creator: 'Kavya Patel',
    handle: '@kavyastyles',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-tanvi.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/evil-eye.jpg`,
    title: 'Shoulder-dusting Kashmiri mirrors! The Navratri viral pair 🌙🪞',
    likes: '45.1K',
    taggedProduct: {
      name: 'Kashmiri Long Mirror-Work Tribal Jhumkas',
      price: 1699,
      slug: 'kashmiri-long-tribal-jhumkas',
    },
  },
  {
    id: '4',
    creator: 'Tanvi Joshi',
    handle: '@tanvi.vibes',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-sneha.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/bestie-gifting.jpg`,
    title: 'That sweet ghungroo chime when you twirl in traditional jhumkas! 💃🔔',
    likes: '32.4K',
    taggedProduct: {
      name: 'Traditional Gujarati Ghungroo Dome Jhumkas',
      price: 1399,
      slug: 'gujarati-ghungroo-dome-jhumkas',
    },
  },
];

export function ReelsCarousel() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rani/10 border border-rani/20 px-3 py-1 text-xs font-bold text-rani mb-2">
            <Instagram className="h-3.5 w-3.5 text-rani" />
            Seen on the 'Gram
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-stone-900 sm:text-3xl font-display">
            #JhumkaJunction IRL ✨
          </h2>
          <p className="mt-1 text-sm text-stone-500 font-sans">
            Watch real Gen Z besties styling our handcrafted &amp; oxidised drops.
          </p>
        </div>
        <Link
          href="https://instagram.com"
          target="_blank"
          className="text-xs font-bold text-rani hover:underline flex items-center gap-1 font-sans"
        >
          Tag @JhumkaJunction to get featured →
        </Link>
      </div>

      {/* Reels Grid with Horizontal Scroll on Small screens */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide snap-x snap-mandatory">
        {REELS.map(reel => (
          <div
            key={reel.id}
            className="group relative flex-none w-[260px] sm:w-auto snap-center flex flex-col overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-500/50"
          >
            {/* Aspect Ratio 9:16 Video Thumbnail Container */}
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-stone-900">
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                sizes="(max-width: 640px) 260px, (max-width: 1024px) 25vw, 300px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/50" />

              {/* Top: Creator pill */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-2 rounded-full bg-stone-950/70 backdrop-blur-md px-2.5 py-1 text-[11px] text-stone-100 border border-white/10">
                  <div className="relative h-4 w-4 overflow-hidden rounded-full border border-amber-400/40">
                    <Image src={reel.avatar} alt={reel.creator} fill sizes="16px" className="object-cover" />
                  </div>
                  <span className="font-semibold truncate max-w-[90px]">{reel.handle}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-pink-300 font-bold drop-shadow bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                  <Heart className="h-3 w-3 fill-rani text-rani" />
                  {reel.likes}
                </div>
              </div>

              {/* Center Play Button Icon */}
              <div className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-md text-white border border-white/40 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-rani/80">
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </div>

              {/* Bottom: Caption & Product Tag */}
              <div className="absolute bottom-3 left-3 right-3 space-y-2 z-10">
                <p className="text-xs font-medium text-white line-clamp-2 drop-shadow-md">
                  {reel.title}
                </p>
                <Link
                  href={`/products/${reel.taggedProduct.slug}`}
                  className="flex items-center justify-between rounded-xl bg-white/95 backdrop-blur-md p-2 text-xs text-stone-900 shadow-md transition-all duration-300 hover:bg-white hover:scale-[1.02] border border-stone-200/50"
                >
                  <div className="truncate mr-2">
                    <p className="truncate font-semibold text-[11px] text-stone-900">{reel.taggedProduct.name}</p>
                    <p className="text-[10px] font-black text-rani">{formatCurrency(reel.taggedProduct.price)}</p>
                  </div>
                  <span className="rounded-lg bg-stone-900 p-1.5 text-white">
                    <ShoppingBag className="h-3 w-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}