// Location: lib/reels-data.ts
import fs from 'fs';
import path from 'path';

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
  createdAt?: string;
}

const SUPABASE_BUCKET_URL = 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

export const DEFAULT_REELS: ReelItem[] = [
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'reels.json');

export function getStoredReels(): ReelItem[] {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(DEFAULT_REELS, null, 2), 'utf-8');
      return DEFAULT_REELS;
    }
    const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REELS;
  } catch (err) {
    console.warn('Error reading reels file:', err);
    return DEFAULT_REELS;
  }
}

export function saveStoredReels(reels: ReelItem[]): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(reels, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing reels file:', err);
  }
}
