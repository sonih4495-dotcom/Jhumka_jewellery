// Location: lib/banner-data.ts
export interface HeroBannerConfig {
  mediaType: 'video' | 'image';
  videoUrl: string;
  posterUrl: string;
  badgeText: string;
  title: string;
  price: number;
  comparePrice?: number;
  linkUrl: string;
  autoPlay: boolean;
  loop: boolean;
  muted: boolean;
  updatedAt?: string;
}

const SUPABASE_BUCKET_URL =
  'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

export const DEFAULT_HERO_BANNER: HeroBannerConfig = {
  mediaType: 'video',
  videoUrl: `${SUPABASE_BUCKET_URL}/videos/1789905734733_5130e938b8e244784da9c2dd2a24699b_540w.mp4`,
  posterUrl: `${SUPABASE_BUCKET_URL}/products/royal-chandbali-1.jpg?v=2`,
  badgeText: '🔥 Navratri Bestseller',
  title: 'Royal Chandbali Oxidised Jhumkas',
  price: 1299,
  comparePrice: 2199,
  linkUrl: '/products/royal-chandbali-oxidised-jhumkas',
  autoPlay: true,
  loop: true,
  muted: true,
  updatedAt: new Date().toISOString(),
};
