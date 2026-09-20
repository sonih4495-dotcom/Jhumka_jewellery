// Location: components/reels-carousel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Volume2,
  VolumeX,
  Heart,
  Instagram,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ReelItem {
  id: string;
  creator: string;
  handle: string;
  avatar: string;
  thumbnail: string;
  videoUrl?: string; // Direct MP4 / WebM video URL
  instagramUrl?: string; // Direct link to Instagram reel / post
  title: string;
  likes: string;
  taggedProduct: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    slug: string;
    image: string;
  };
}

const SUPABASE_BUCKET_URL = 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

export const REELS_DATA: ReelItem[] = [
  {
    id: '1',
    creator: 'Ananya Sharma',
    handle: '@ananya.glam',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-ananya.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/garba-glam.jpg`,
    videoUrl: `${SUPABASE_BUCKET_URL}/videos/1789902892881_5130e938b8e244784da9c2dd2a24699b_540w.mp4`,
    instagramUrl: 'https://instagram.com',
    title: 'Garba night styling with Royal Chandbali jhumkas! 🌙✨',
    likes: '14.2K',
    taggedProduct: {
      id: 'chandbali-1',
      name: 'Royal Chandbali Oxidised Silver Jhumkas',
      price: 1299,
      comparePrice: 1999,
      slug: 'royal-chandbali-oxidised-jhumkas',
      image: `${SUPABASE_BUCKET_URL}/categories/chandbali-jhumkas.jpg`,
    },
  },
  {
    id: '2',
    creator: 'Riya Mehta',
    handle: '@riya_drips',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-priya.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/date-night.jpg`,
    videoUrl: `${SUPABASE_BUCKET_URL}/videos/1789903187531_5130e938b8e244784da9c2dd2a24699b_540w.mp4`,
    instagramUrl: 'https://instagram.com',
    title: 'Twin dome peacock jhumkas for ethnic festive dates! 🦚✨',
    likes: '28.9K',
    taggedProduct: {
      id: 'peacock-1',
      name: 'Peacock Filigree Dual Dome Jhumkas',
      price: 1499,
      comparePrice: 2199,
      slug: 'peacock-filigree-dual-dome-jhumkas',
      image: `${SUPABASE_BUCKET_URL}/categories/peacock-floral-jhumkas.jpg`,
    },
  },
  {
    id: '3',
    creator: 'Kavya Patel',
    handle: '@kavyastyles',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-tanvi.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/evil-eye.jpg`,
    videoUrl: `${SUPABASE_BUCKET_URL}/videos/1789902892881_5130e938b8e244784da9c2dd2a24699b_540w.mp4`,
    instagramUrl: 'https://instagram.com',
    title: 'Shoulder-dusting Kashmiri mirrors! The Navratri viral pair 🌙🪞',
    likes: '45.1K',
    taggedProduct: {
      id: 'kashmiri-1',
      name: 'Kashmiri Long Mirror-Work Tribal Jhumkas',
      price: 1699,
      comparePrice: 2499,
      slug: 'kashmiri-long-tribal-jhumkas',
      image: `${SUPABASE_BUCKET_URL}/categories/kashmiri-afghan-jhumkas.jpg`,
    },
  },
  {
    id: '4',
    creator: 'Tanvi Joshi',
    handle: '@tanvi.vibes',
    avatar: `${SUPABASE_BUCKET_URL}/ui/avatar-sneha.jpg`,
    thumbnail: `${SUPABASE_BUCKET_URL}/vibes/bestie-gifting.jpg`,
    videoUrl: `${SUPABASE_BUCKET_URL}/videos/1789903187531_5130e938b8e244784da9c2dd2a24699b_540w.mp4`,
    instagramUrl: 'https://instagram.com',
    title: 'That sweet ghungroo chime when you twirl in traditional jhumkas! 💃🔔',
    likes: '32.4K',
    taggedProduct: {
      id: 'temple-1',
      name: 'Traditional Gujarati Ghungroo Dome Jhumkas',
      price: 1399,
      comparePrice: 1899,
      slug: 'gujarati-ghungroo-dome-jhumkas',
      image: `${SUPABASE_BUCKET_URL}/categories/dome-temple-jhumkas.jpg`,
    },
  },
];

export function ReelsCarousel() {
  const [reels, setReels] = useState<ReelItem[]>(REELS_DATA);

  useEffect(() => {
    fetch('/api/reels')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.reels) && data.reels.length > 0) {
          setReels(data.reels);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Header */}
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
            Watch real Gen Z besties styling our handcrafted &amp; oxidised drops. Click any reel to view and shop the product!
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

      {/* Reels Grid: Autoplaying & Click to open Product */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-5 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide snap-x snap-mandatory">
        {reels.map(reel => (
          <ReelProductCard key={reel.id} reel={reel} />
        ))}
      </div>
    </section>
  );
}

// Interactive Reel Video Card that plays video continuously and opens product on click
function ReelProductCard({ reel }: { reel: ReelItem }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Bulletproof universal auto-play
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !reel.videoUrl) return;

    video.defaultMuted = true;
    video.muted = isMuted;

    const attemptPlay = () => {
      if (!video) return;
      video.muted = isMuted;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser policy blocked unmuted or initial play, enforce muted play
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    };

    attemptPlay();

    // Auto-play when scrolled into view
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            attemptPlay();
          } else {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);

    // Fallback: auto-trigger on first user scroll / touch / click if browser had strict policy
    const handleFirstGesture = () => {
      attemptPlay();
    };

    window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('scroll', handleFirstGesture, { once: true, passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };
  }, [reel.videoUrl, isMuted]);

  const handleCardClick = () => {
    if (reel.taggedProduct?.slug) {
      router.push(`/products/${reel.taggedProduct.slug}`);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex-none w-[270px] sm:w-auto snap-center flex flex-col overflow-hidden rounded-3xl border border-stone-800/80 bg-stone-950 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-400/60 cursor-pointer select-none"
    >
      {/* 9:16 Ratio Video Container */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-stone-900">
        {/* Real-time Video Progress Bar at Top */}
        {reel.videoUrl && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-100 ease-linear shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Seamlessly Playing Reel Video or Fallback Image */}
        {reel.videoUrl ? (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={reel.thumbnail}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) {
                setProgress((v.currentTime / v.duration) * 100);
              }
            }}
            onCanPlay={(e) => {
              const v = e.currentTarget;
              v.muted = isMuted;
              v.play().then(() => setIsPlaying(true)).catch(() => {});
            }}
            onLoadedMetadata={(e) => {
              const v = e.currentTarget;
              v.muted = isMuted;
              v.play().then(() => setIsPlaying(true)).catch(() => {});
            }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <Image
            src={reel.thumbnail}
            alt={reel.title}
            fill
            sizes="(max-width: 640px) 270px, (max-width: 1024px) 25vw, 320px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/50 pointer-events-none" />

        {/* Top Header: Creator Tag, Live Status & Sound Toggle */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-1 text-[11px] text-stone-100 border border-white/15 shadow">
            <div className="relative h-4 w-4 overflow-hidden rounded-full border border-amber-400">
              <Image src={reel.avatar} alt={reel.creator} fill sizes="16px" className="object-cover" />
            </div>
            <span className="font-bold truncate max-w-[85px]">{reel.handle}</span>
            {isPlaying && reel.videoUrl && (
              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            {reel.videoUrl && (
              <button
                type="button"
                onClick={toggleSound}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/65 backdrop-blur-md text-white border border-white/20 hover:bg-black hover:scale-110 active:scale-95 transition-all shadow"
                aria-label={isMuted ? 'Unmute reel' : 'Mute reel'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-stone-300" /> : <Volume2 className="h-3.5 w-3.5 text-amber-300 animate-pulse" />}
              </button>
            )}

            {/* Likes */}
            <div className="flex items-center gap-1 text-[10px] text-pink-200 font-bold bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow">
              <Heart className="h-3 w-3 fill-rani text-rani" />
              {reel.likes}
            </div>
          </div>
        </div>

        {/* Hover Cue: "Click to Shop Look" Pill */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-20 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-1.5 text-xs font-black text-stone-950 shadow-2xl border border-amber-300/60">
            <Sparkles className="h-3.5 w-3.5" />
            Shop This Look →
          </span>
        </div>

        {/* Bottom Section: Title & Tagged Product Banner */}
        <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-2.5 z-10">
          <p className="text-xs font-medium text-stone-100 line-clamp-2 drop-shadow-md leading-relaxed">
            {reel.title}
          </p>

          {/* Tagged Product Chip */}
          <div
            onClick={e => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex items-center gap-2.5 rounded-2xl bg-stone-900/95 backdrop-blur-md p-2.5 border border-stone-700/80 shadow-2xl transition-all duration-300 group-hover:border-amber-400/80 group-hover:bg-stone-900"
          >
            {/* Product Thumbnail */}
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-stone-700 bg-stone-800">
              <Image
                src={reel.taggedProduct.image}
                alt={reel.taggedProduct.name}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                {reel.taggedProduct.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-amber-400">
                  {formatCurrency(reel.taggedProduct.price)}
                </span>
                {reel.taggedProduct.comparePrice && (
                  <span className="text-[10px] text-stone-400 line-through">
                    {formatCurrency(reel.taggedProduct.comparePrice)}
                  </span>
                )}
              </div>
            </div>

            {/* CTA Arrow */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-md group-hover:scale-105 transition-transform">
              <ArrowRight className="h-4 w-4 font-bold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}