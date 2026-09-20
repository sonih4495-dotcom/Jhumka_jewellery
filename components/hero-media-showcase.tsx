'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Volume2, VolumeX, Play, Pause, ShoppingBag, ExternalLink } from 'lucide-react';
import { HeroBannerConfig } from '@/lib/banner-data';

interface HeroMediaShowcaseProps {
  banner: HeroBannerConfig;
}

export function HeroMediaShowcase({ banner }: HeroMediaShowcaseProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(banner.autoPlay ?? true);
  const [isMuted, setIsMuted] = useState<boolean>(banner.muted ?? true);
  const [showControls, setShowControls] = useState<boolean>(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || banner.mediaType !== 'video') return;

    video.muted = isMuted;

    if (banner.autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn('Hero video autoplay blocked by browser, muting and retrying:', err);
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
      }
    }
  }, [banner.videoUrl, banner.mediaType, banner.autoPlay]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const discountPercent =
    banner.comparePrice && banner.comparePrice > banner.price
      ? Math.round(((banner.comparePrice - banner.price) / banner.comparePrice) * 100)
      : null;

  return (
    <div
      className="relative mx-auto max-w-sm rounded-3xl border border-amber-400/30 bg-stone-900/60 p-2.5 sm:p-3 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] gold-border-glow group select-none"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-950">
        {banner.mediaType === 'video' && banner.videoUrl ? (
          <>
            {/* Auto-looping video player */}
            <video
              ref={videoRef}
              src={banner.videoUrl}
              poster={banner.posterUrl}
              autoPlay={banner.autoPlay}
              loop={banner.loop}
              muted={isMuted}
              playsInline
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
              onClick={togglePlayPause}
            />

            {/* Ambient vignette gradient */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

            {/* Top Toolbar: Live Video Indicator + Mute/Unmute */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-amber-300 border border-amber-400/30 shadow-md">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                Featured Reel
              </span>

              <div className="flex items-center gap-1.5">
                {/* Audio Mute/Unmute toggle */}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video sound' : 'Mute video sound'}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/20 hover:bg-black/80 hover:border-amber-400/50 transition-all hover:scale-110 active:scale-95 shadow-lg"
                  title={isMuted ? 'Click to unmute' : 'Click to mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-stone-300" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-amber-300 animate-pulse" />
                  )}
                </button>
              </div>
            </div>

            {/* Center Play/Pause indicator */}
            {(!isPlaying || showControls) && (
              <button
                type="button"
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
                className={`absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-black/80 hover:border-amber-400 active:scale-95 z-20 ${
                  !isPlaying ? 'opacity-100 scale-100' : 'opacity-80 scale-95'
                }`}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-amber-300 fill-amber-300" />
                ) : (
                  <Play className="h-6 w-6 text-amber-300 fill-amber-300 ml-0.5" />
                )}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Fallback Static Image */}
            <Image
              src={banner.posterUrl || '/images/hero-jhumka.jpg'}
              alt={banner.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
          </>
        )}

        {/* Bottom Product Info Card Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-20 text-left">
          <Link
            href={banner.linkUrl || '/products'}
            className="block group/link"
          >
            {banner.badgeText && (
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-rani to-pink-600 px-2.5 py-0.5 text-[10px] font-bold text-white mb-1.5 shadow-md border border-white/20">
                {banner.badgeText}
              </span>
            )}
            <div className="flex items-center justify-between gap-2">
              <p className="font-display font-bold text-base text-white group-hover/link:text-amber-300 transition-colors line-clamp-1">
                {banner.title}
              </p>
              <ExternalLink className="h-3.5 w-3.5 text-stone-400 group-hover/link:text-amber-300 transition-colors shrink-0" />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-amber-300 font-extrabold flex items-center gap-1.5">
                ₹{banner.price.toLocaleString('en-IN')}
                {banner.comparePrice && banner.comparePrice > banner.price && (
                  <span className="line-through text-stone-400 font-normal text-xs">
                    ₹{banner.comparePrice.toLocaleString('en-IN')}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                    {discountPercent}% OFF
                  </span>
                )}
              </p>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-300 hover:text-white transition-colors bg-white/10 hover:bg-rose-600/80 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/15">
                <ShoppingBag className="h-3 w-3" /> Shop Piece
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
