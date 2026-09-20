'use client';

import { useState, useRef } from 'react';
import {
  Video,
  Image as ImageIcon,
  Upload,
  Check,
  Sparkles,
  Save,
  RefreshCw,
  ExternalLink,
  Play,
  Volume2,
  VolumeX,
  Tag,
  ShoppingBag,
  Info,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { HeroBannerConfig } from '@/lib/banner-data';
import { HeroMediaShowcase } from '@/components/hero-media-showcase';

interface ProductOption {
  id: string;
  name: string;
  price?: number;
  comparePrice?: number;
  slug?: string;
  image?: string;
}

interface AdminHeroBannerStudioProps {
  initialBanner: HeroBannerConfig;
  availableVideos: { name: string; url: string; size: number }[];
  products: ProductOption[];
  onRefresh: () => void;
}

const BADGE_PRESETS = [
  '🔥 Navratri Bestseller',
  '✨ Viral on Reels',
  '⚡ New Drop • Limited Stock',
  '💎 Handcrafted Masterpiece',
  '🌙 Festive Special',
  '🦚 Royal Heritage Edition',
];

export function AdminHeroBannerStudio({
  initialBanner,
  availableVideos,
  products,
  onRefresh,
}: AdminHeroBannerStudioProps) {
  const [config, setConfig] = useState<HeroBannerConfig>(initialBanner);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prodId = e.target.value;
    if (!prodId) return;
    const found = products.find((p) => p.id === prodId);
    if (found) {
      setConfig((prev) => ({
        ...prev,
        title: found.name,
        price: found.price ? Number(found.price) : prev.price,
        comparePrice: found.comparePrice ? Number(found.comparePrice) : prev.comparePrice,
        linkUrl: found.slug ? `/products/${found.slug}` : prev.linkUrl,
        posterUrl: found.image || prev.posterUrl,
      }));
      toast.success(`Populated details from "${found.name}"`);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select an MP4 or WebM video file');
      return;
    }

    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'videos');
      const filename = `hero_video_${Date.now()}`;
      formData.append('filename', filename);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.publicUrl) {
        setConfig((prev) => ({
          ...prev,
          videoUrl: data.publicUrl,
          mediaType: 'video',
        }));
        toast.success('Video uploaded to Supabase Storage and set as Hero Banner!');
        onRefresh();
      } else {
        toast.error(data.error || 'Video upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading video');
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploadingPoster(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'banners');
      const filename = `hero_poster_${Date.now()}`;
      formData.append('filename', filename);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.publicUrl) {
        setConfig((prev) => ({
          ...prev,
          posterUrl: data.publicUrl,
        }));
        toast.success('Poster thumbnail uploaded to Supabase Storage!');
        onRefresh();
      } else {
        toast.error(data.error || 'Poster upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error uploading poster');
    } finally {
      setIsUploadingPoster(false);
      if (posterFileInputRef.current) posterFileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/hero-banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Hero banner updated! Changes are live on homepage.');
        setConfig(data.banner);
      } else {
        toast.error(data.error || 'Failed to save changes');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving hero banner');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Intro Alert */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-stone-900/5 border border-amber-400/30">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-bold shadow-md">
            <Video className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Home Hero Banner Video Showcase
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
              Configure the continuous auto-looping video in the homepage hero section. You can pick an existing video uploaded to Supabase, upload a new clip, or customize product details and pricing.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-amber-700 text-white font-bold px-6 shadow-lg shadow-rose-950/20 shrink-0"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save &amp; Publish Live
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT COLUMN: Configuration Controls (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card 1: Media Type & Video Source */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Video className="h-4 w-4 text-rose-600" />
                1. Media Type &amp; Video Source
              </h3>
              <Badge variant="outline" className="text-[11px] font-semibold">
                {config.mediaType === 'video' ? '🎥 Looping Video' : '🖼️ Static Image'}
              </Badge>
            </div>

            {/* Media Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, mediaType: 'video' }))}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  config.mediaType === 'video'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Video className="h-4 w-4 text-rose-600" />
                Video (Auto-Looping)
              </button>
              <button
                type="button"
                onClick={() => setConfig((prev) => ({ ...prev, mediaType: 'image' }))}
                className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                  config.mediaType === 'image'
                    ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <ImageIcon className="h-4 w-4 text-amber-600" />
                Static Photo
              </button>
            </div>

            {config.mediaType === 'video' && (
              <div className="space-y-4 pt-1">
                {/* 1-Click Pick from Existing Supabase Videos */}
                {availableVideos.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-2 flex items-center justify-between">
                      <span>Quick Select from Uploaded Supabase Videos:</span>
                      <span className="text-[11px] text-stone-400 font-normal">
                        {availableVideos.length} video(s) found
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {availableVideos.map((v) => {
                        const isSelected = config.videoUrl === v.url;
                        return (
                          <div
                            key={v.url}
                            onClick={() =>
                              setConfig((prev) => ({ ...prev, videoUrl: v.url, mediaType: 'video' }))
                            }
                            className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-rose-500 bg-rose-50/70 text-rose-900 shadow-sm ring-1 ring-rose-500'
                                : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isSelected ? 'bg-rose-600 text-white' : 'bg-stone-200 text-stone-600'
                              }`}
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                            </span>
                            <div className="truncate flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{v.name}</p>
                              <p className="text-[10px] text-stone-400">
                                {(v.size / (1024 * 1024)).toFixed(1)} MB • Supabase
                              </p>
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-rose-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload New Video to Supabase */}
                <div className="p-3.5 rounded-xl border border-dashed border-stone-300 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <Upload className="h-3.5 w-3.5 text-rose-600" />
                      Upload New Video File (MP4 / WebM)
                    </span>
                    <span className="text-[10px] text-stone-500">Auto-uploads to Supabase /videos</span>
                  </div>

                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingVideo}
                    onClick={() => videoFileInputRef.current?.click()}
                    className="w-full rounded-xl border-stone-300 hover:bg-stone-100 text-xs font-bold h-9"
                  >
                    {isUploadingVideo ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin text-rose-600" />
                        Uploading to Supabase Storage...
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5 mr-2 text-rose-600" />
                        Choose MP4 Video File from Device
                      </>
                    )}
                  </Button>
                </div>

                {/* Direct Video URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Video Direct URL</label>
                  <Input
                    type="url"
                    value={config.videoUrl}
                    onChange={(e) => setConfig((prev) => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="https://...supabase.co/storage/v1/object/public/jewellery/videos/..."
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Poster / Fallback Image */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-600" />
                  Poster / Fallback Image URL
                </label>
                <button
                  type="button"
                  onClick={() => posterFileInputRef.current?.click()}
                  disabled={isUploadingPoster}
                  className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <Upload className="h-3 w-3" /> Upload Poster
                </button>
              </div>

              <input
                ref={posterFileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePosterUpload}
                className="hidden"
              />

              <Input
                type="url"
                value={config.posterUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, posterUrl: e.target.value }))}
                placeholder="https://...supabase.co/.../products/..."
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Card 2: Featured Product Details & Copy */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-600" />
                2. Featured Product Details
              </h3>
              <span className="text-[11px] text-stone-500">Overlaid on the video card</span>
            </div>

            {/* 1-Click Product Auto-Populate */}
            {products.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-rose-600" />
                  Quick-Link Catalog Product (Auto-Fills Details):
                </label>
                <select
                  onChange={handleProductSelect}
                  defaultValue=""
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-medium text-stone-800 focus:border-amber-400 focus:outline-none"
                >
                  <option value="" disabled>
                    -- Select product to autofill title, price, and link --
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price?.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Badge Text & Presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700">Badge Text</label>
              <Input
                type="text"
                value={config.badgeText}
                onChange={(e) => setConfig((prev) => ({ ...prev, badgeText: e.target.value }))}
                placeholder="🔥 Navratri Bestseller"
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BADGE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, badgeText: preset }))}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      config.badgeText === preset
                        ? 'bg-rose-600 text-white border-rose-600 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Showcase Title</label>
              <Input
                type="text"
                value={config.title}
                onChange={(e) => setConfig((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Royal Chandbali Oxidised Jhumkas"
                className="h-9 text-xs font-semibold"
              />
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Sale Price (₹ INR)</label>
                <Input
                  type="number"
                  value={config.price}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))
                  }
                  placeholder="1299"
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Compare Price (₹ INR)</label>
                <Input
                  type="number"
                  value={config.comparePrice || ''}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      comparePrice: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  placeholder="2199"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Destination URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Product Page Link URL</label>
              <Input
                type="text"
                value={config.linkUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, linkUrl: e.target.value }))}
                placeholder="/products/royal-chandbali-oxidised-jhumkas"
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Card 3: Autoplay & Playback Rules */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
            <div className="border-b pb-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                3. Continuous Playback &amp; Autoplay Rules
              </h3>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50/70 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.autoPlay}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, autoPlay: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900">AutoPlay on Page Load</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Starts video immediately when the customer opens the website.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 hover:bg-stone-50/70 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.loop}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, loop: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <p className="text-xs font-bold text-stone-900">Loop Continuously</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    When the video ends, it replays seamlessly from the beginning with no interruption.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={config.muted}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, muted: e.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-amber-950">Start Muted (Recommended)</p>
                    <Badge className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0 border-0">
                      Standard
                    </Badge>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Required by Chrome, Safari, iOS, and Android policies to permit autoplay without blocking. Visitors can unmute at any time using the speaker icon on the video.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-2 flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-amber-700 text-white font-bold py-6 text-sm shadow-xl shadow-rose-950/20"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save &amp; Publish Hero Banner
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Real-Time Interactive Card Preview (5 Cols) ── */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="rounded-3xl border border-stone-800 bg-[#141312] p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold tracking-wide uppercase text-amber-400">
                  Live Customer Preview
                </h3>
              </div>
              <span className="text-[11px] text-stone-400">Desktop &amp; Mobile</span>
            </div>

            {/* Interactive Card Render */}
            <div className="py-2">
              <HeroMediaShowcase banner={config} />
            </div>

            {/* Verification Link */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-stone-400">Destination:</span>
              <a
                href={config.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-amber-300 hover:underline flex items-center gap-1 max-w-[200px] truncate"
              >
                {config.linkUrl}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
