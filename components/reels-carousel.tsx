// Location: components/reels-carousel.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Volume2,
  VolumeX,
  Heart,
  Instagram,
  ShoppingBag,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AddToCart } from './add-to-cart';
import { BuyNowButton } from './buy-now-button';

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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-showing-her-earrings-41006-large.mp4',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-touching-her-earring-41007-large.mp4',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-wearing-traditional-indian-jewelry-41009-large.mp4',
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
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-woman-with-silver-earrings-41008-large.mp4',
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
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const activeReel = activeReelIndex !== null ? REELS_DATA[activeReelIndex] : null;

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (activeReelIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveReelIndex(null);
      } else if (e.key === 'ArrowRight') {
        setActiveReelIndex(prev => (prev !== null && prev < REELS_DATA.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
        setActiveReelIndex(prev => (prev !== null && prev > 0 ? prev - 1 : REELS_DATA.length - 1));
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, isPlaying]);

  // Handle modal video playback when active reel changes
  useEffect(() => {
    if (modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [activeReelIndex]);

  const togglePlayPause = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setIsPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalVideoRef.current) return;
    modalVideoRef.current.muted = !modalVideoRef.current.muted;
    setIsMuted(modalVideoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (modalVideoRef.current && modalVideoRef.current.duration) {
      setProgress((modalVideoRef.current.currentTime / modalVideoRef.current.duration) * 100);
    }
  };

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
            Watch real Gen Z besties styling our handcrafted &amp; oxidised drops. Tap any reel to watch with sound!
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

      {/* Reels Grid */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4 overflow-x-auto pb-4 sm:pb-0 scrollbar-hide snap-x snap-mandatory">
        {REELS_DATA.map((reel, index) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            onOpen={() => {
              setActiveReelIndex(index);
              setIsMuted(false);
            }}
          />
        ))}
      </div>

      {/* ── Fullscreen / Popup Reels Video Modal ── */}
      {activeReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in-0 duration-200"
          onClick={() => setActiveReelIndex(null)}
        >
          <div
            className="relative flex flex-col md:flex-row w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveReelIndex(null)}
              className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black hover:scale-105 active:scale-95 transition-all border border-white/20"
              aria-label="Close reel player"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Left/Main Column: 9:16 Video Player */}
            <div
              className="relative aspect-[9/16] w-full md:w-[420px] shrink-0 bg-black overflow-hidden cursor-pointer select-none flex items-center justify-center group"
              onClick={togglePlayPause}
            >
              {activeReel.videoUrl ? (
                <video
                  ref={modalVideoRef}
                  src={activeReel.videoUrl}
                  poster={activeReel.thumbnail}
                  playsInline
                  autoPlay
                  loop
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative h-full w-full">
                  <Image
                    src={activeReel.thumbnail}
                    alt={activeReel.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Video Progress Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
                <div
                  className="h-full bg-gradient-to-r from-rani to-amber-400 transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Play / Pause Center Overlay indicator on toggle */}
              {!isPlaying && (
                <div className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/30 shadow-2xl">
                  <Play className="h-8 w-8 fill-white ml-1" />
                </div>
              )}

              {/* Video Bottom Left Overlay: Mute Toggle & Creator Info */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs text-white border border-white/10">
                  <div className="relative h-5 w-5 overflow-hidden rounded-full border border-amber-400">
                    <Image src={activeReel.avatar} alt={activeReel.creator} fill sizes="20px" className="object-cover" />
                  </div>
                  <span className="font-bold">{activeReel.handle}</span>
                </div>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black border border-white/20 transition-all active:scale-90"
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-amber-300" />}
                </button>
              </div>

              {/* Previous / Next Reel Buttons */}
              {REELS_DATA.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveReelIndex(prev => (prev !== null && prev > 0 ? prev - 1 : REELS_DATA.length - 1));
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous reel"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setActiveReelIndex(prev => (prev !== null && prev < REELS_DATA.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next reel"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Right Column: Reel Details, Creator Tag & Tagged Product Checkout */}
            <div className="flex flex-1 flex-col justify-between p-5 md:p-6 bg-stone-900 text-white overflow-y-auto">
              <div className="space-y-4">
                {/* Creator Profile line */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-amber-400/80 shadow-md">
                      <Image src={activeReel.avatar} alt={activeReel.creator} fill sizes="44px" className="object-cover" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {activeReel.creator}
                        <span className="text-[10px] text-amber-400">✨ Verified Bestie</span>
                      </h4>
                      <p className="text-xs text-stone-400 font-medium">{activeReel.handle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 px-3 py-1 text-xs font-bold text-pink-300">
                    <Heart className="h-3.5 w-3.5 fill-rani text-rani" />
                    {activeReel.likes}
                  </div>
                </div>

                {/* Caption / Reel Title */}
                <div>
                  <p className="text-sm text-stone-200 leading-relaxed font-sans">
                    {activeReel.title}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1 font-mono">
                    #JhumkaJunction #OxidisedJewellery #FestiveDrop #GenZFashion
                  </p>
                </div>

                {/* Instagram Direct Link Badge (if applicable) */}
                {activeReel.instagramUrl && (
                  <Link
                    href={activeReel.instagramUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-amber-900/40 border border-pink-500/30 px-3 py-2 text-xs font-semibold text-pink-200 hover:text-white hover:border-pink-500/60 transition-all"
                  >
                    <Instagram className="h-4 w-4 text-pink-400" />
                    <span>View original styling reel on Instagram</span>
                    <ExternalLink className="h-3.5 w-3.5 ml-auto text-stone-400" />
                  </Link>
                )}
              </div>

              {/* Tagged Jewellery Piece: Instant Shop & Buy Now Card */}
              <div className="mt-6 rounded-2xl bg-stone-950 border border-stone-800 p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Featured In This Look
                  </span>
                  <Link
                    href={`/products/${activeReel.taggedProduct.slug}`}
                    onClick={() => setActiveReelIndex(null)}
                    className="text-xs font-bold text-rani hover:underline"
                  >
                    View Details →
                  </Link>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-800 bg-stone-900">
                    <Image
                      src={activeReel.taggedProduct.image}
                      alt={activeReel.taggedProduct.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${activeReel.taggedProduct.slug}`}
                      onClick={() => setActiveReelIndex(null)}
                      className="text-xs font-bold text-white hover:text-amber-300 transition-colors line-clamp-1"
                    >
                      {activeReel.taggedProduct.name}
                    </Link>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-sm font-black text-amber-300">
                        {formatCurrency(activeReel.taggedProduct.price)}
                      </span>
                      {activeReel.taggedProduct.comparePrice && (
                        <span className="text-xs text-stone-500 line-through">
                          {formatCurrency(activeReel.taggedProduct.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two-part CTA: Quick Add & Direct Buy Now */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <AddToCart
                    productId={activeReel.taggedProduct.id}
                    productName={activeReel.taggedProduct.name}
                    price={activeReel.taggedProduct.price}
                    comparePrice={activeReel.taggedProduct.comparePrice}
                    image={activeReel.taggedProduct.image}
                    slug={activeReel.taggedProduct.slug}
                    size="sm"
                    className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs h-9 border border-stone-700"
                  />
                  <BuyNowButton
                    productId={activeReel.taggedProduct.id}
                    productName={activeReel.taggedProduct.name}
                    price={activeReel.taggedProduct.price}
                    comparePrice={activeReel.taggedProduct.comparePrice}
                    image={activeReel.taggedProduct.image}
                    slug={activeReel.taggedProduct.slug}
                    size="sm"
                    className="w-full rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 font-black text-xs h-9 shadow-md border-0"
                  >
                    ⚡ Buy Now
                  </BuyNowButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Individual Reel Card in Grid with video hover preview
function ReelCard({ reel, onOpen }: { reel: ReelItem; onOpen: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onClick={onOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex-none w-[260px] sm:w-auto snap-center flex flex-col overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:border-amber-500/50 cursor-pointer"
    >
      {/* 9:16 Video / Thumbnail Container */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-stone-900">
        {/* Background Image / Poster */}
        <Image
          src={reel.thumbnail}
          alt={reel.title}
          fill
          sizes="(max-width: 640px) 260px, (max-width: 1024px) 25vw, 300px"
          className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
            isHovered && reel.videoUrl ? 'opacity-0' : 'opacity-90 group-hover:opacity-100'
          }`}
        />

        {/* Hover Silent Auto-playing Video */}
        {reel.videoUrl && (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            playsInline
            muted
            loop
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

        {/* Top: Creator pill */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 rounded-full bg-stone-950/75 backdrop-blur-md px-2.5 py-1 text-[11px] text-stone-100 border border-white/10">
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

        {/* Bottom: Caption & Tagged Product Link */}
        <div className="absolute bottom-3 left-3 right-3 space-y-2 z-10">
          <p className="text-xs font-medium text-white line-clamp-2 drop-shadow-md">
            {reel.title}
          </p>
          <div
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-between rounded-xl bg-white/95 backdrop-blur-md p-2 text-xs text-stone-900 shadow-md transition-all duration-300 hover:bg-white hover:scale-[1.02] border border-stone-200/50"
          >
            <Link
              href={`/products/${reel.taggedProduct.slug}`}
              className="truncate mr-2 flex-1"
            >
              <p className="truncate font-semibold text-[11px] text-stone-900">{reel.taggedProduct.name}</p>
              <p className="text-[10px] font-black text-rani">{formatCurrency(reel.taggedProduct.price)}</p>
            </Link>
            <Link
              href={`/products/${reel.taggedProduct.slug}`}
              className="rounded-lg bg-stone-900 p-1.5 text-white hover:bg-black transition-colors"
            >
              <ShoppingBag className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}