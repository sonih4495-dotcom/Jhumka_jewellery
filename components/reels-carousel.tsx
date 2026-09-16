// Location: components/reels-carousel.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Heart, Instagram, ShoppingBag } from 'lucide-react';
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

const REELS: ReelItem[] = [
  {
    id: '1',
    creator: 'Ananya Sharma',
    handle: '@ananya.glam',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    title: 'Garba night styling with oxidised jhumkas! 🌙✨',
    likes: '14.2K',
    taggedProduct: {
      name: 'Chandbali Oxidised Silver Jhumkas',
      price: 1199,
      slug: 'chandbali-oxidised-silver-jhumkas',
    },
  },
  {
    id: '2',
    creator: 'Riya Mehta',
    handle: '@riya_drips',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    title: 'Stacking aesthetic rings for college vibe ☁️💍',
    likes: '28.9K',
    taggedProduct: {
      name: 'Dainty Sparkling Solitaire Adjustable Ring',
      price: 899,
      slug: 'dainty-sparkling-925-solitaire-ring',
    },
  },
  {
    id: '3',
    creator: 'Kavya Patel',
    handle: '@kavyastyles',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    title: 'Ward off bad vibes with this evil eye chain 🧿✨',
    likes: '45.1K',
    taggedProduct: {
      name: 'Layered Evil Eye Pendant',
      price: 1499,
      slug: 'layered-evil-eye-pure-silver-pendant',
    },
  },
  {
    id: '4',
    creator: 'Tanvi Joshi',
    handle: '@tanvi.vibes',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    title: 'That ghungroo chime when you walk in oxidised payal 💃🔔',
    likes: '32.4K',
    taggedProduct: {
      name: 'Boho Tribal Ghungroo Anklet Pair',
      price: 1799,
      slug: 'boho-tribal-ghungroo-silver-anklet',
    },
  },
];

export function ReelsCarousel() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs px-2.5 py-0.5 rounded-full shadow-sm border-0">
              <Instagram className="mr-1 h-3 w-3" /> Seen on the 'Gram
            </Badge>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl font-display">
            #JhumkaJunction IRL ✨
          </h2>
          <p className="mt-1 text-sm text-gray-500 font-sans">
            Watch real Gen Z besties styling our handcrafted &amp; oxidised drops.
          </p>
        </div>
        <Link
          href="https://instagram.com"
          target="_blank"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-sans"
        >
          Tag @JhumkaJunction to get featured →
        </Link>
      </div>

      {/* Reels Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {REELS.map(reel => (
          <div
            key={reel.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Aspect Ratio 9:16 Video Thumbnail Container */}
            <div className="relative aspect-[9/16] w-full overflow-hidden bg-gray-900">
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

              {/* Top: Creator pill */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] text-white">
                  <div className="relative h-4 w-4 overflow-hidden rounded-full">
                    <Image src={reel.avatar} alt={reel.creator} fill sizes="16px" className="object-cover" />
                  </div>
                  <span className="font-semibold truncate max-w-[90px]">{reel.handle}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-rose-300 font-bold drop-shadow">
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  {reel.likes}
                </div>
              </div>

              {/* Center Play Button Icon */}
              <div className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-white transition-transform group-hover:scale-110 shadow-lg">
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </div>

              {/* Bottom: Caption & Product Tag */}
              <div className="absolute bottom-3 left-3 right-3 space-y-2">
                <p className="text-xs font-medium text-white line-clamp-2 drop-shadow-md">
                  {reel.title}
                </p>
                <Link
                  href={`/products/${reel.taggedProduct.slug}`}
                  className="flex items-center justify-between rounded-xl bg-white/95 backdrop-blur-md p-2 text-xs text-gray-900 shadow-md transition-all hover:bg-white"
                >
                  <div className="truncate mr-2">
                    <p className="truncate font-semibold text-[11px] text-gray-900">{reel.taggedProduct.name}</p>
                    <p className="text-[10px] font-bold text-rose-600">{formatCurrency(reel.taggedProduct.price)}</p>
                  </div>
                  <span className="rounded-lg bg-gray-900 p-1.5 text-white">
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