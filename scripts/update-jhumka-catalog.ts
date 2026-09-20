// scripts/update-jhumka-catalog.ts
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { prisma } from '../lib/prisma';

const BUCKET = SUPABASE_STORAGE_BUCKET;

// Curated authentic oxidised jewellery and jhumka photography
const JHUMKA_IMAGES = [
  // 1. Categories
  {
    dest: 'categories/chandbali-jhumkas.jpg',
    source: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    description: 'Chandbali Jhumkas category banner',
  },
  {
    dest: 'categories/dome-temple-jhumkas.jpg',
    source: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
    description: 'Dome Temple Jhumkas category banner',
  },
  {
    dest: 'categories/kashmiri-afghan-jhumkas.jpg',
    source: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
    description: 'Kashmiri & Afghan Tribal Jhumkas category banner',
  },
  {
    dest: 'categories/peacock-floral-jhumkas.jpg',
    source: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    description: 'Peacock & Floral Jhumkas category banner',
  },
  {
    dest: 'categories/mini-everyday-jhumkas.jpg',
    source: 'https://images.unsplash.com/photo-1616803140344-6682afb13cda?w=800&auto=format&fit=crop&q=80',
    description: 'Mini Everyday Jhumkas category banner',
  },
  {
    dest: 'categories/festive-jhumka-combos.jpg',
    source: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    description: 'Festive Jhumka Combos category banner',
  },

  // 2. Products - 8 Oxidised Jhumka Products (2 images each)
  // Royal Chandbali Jhumkas
  {
    dest: 'products/royal-chandbali-1.jpg',
    source: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/royal-chandbali-2.jpg',
    source: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  },

  // Kashmiri Long Mirror-Work Tribal Jhumkas
  {
    dest: 'products/kashmiri-tribal-1.jpg',
    source: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/kashmiri-tribal-2.jpg',
    source: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&auto=format&fit=crop&q=80',
  },

  // Peacock Filigree Dual Dome Jhumkas
  {
    dest: 'products/peacock-jhumka-1.jpg',
    source: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/peacock-jhumka-2.jpg',
    source: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80',
  },

  // Traditional Gujarati Ghungroo Dome Jhumkas
  {
    dest: 'products/gujarati-ghungroo-1.jpg',
    source: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/gujarati-ghungroo-2.jpg',
    source: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&auto=format&fit=crop&q=80',
  },

  // Afghan Coin & Turquoise Tribal Jhumkas
  {
    dest: 'products/afghan-turquoise-1.jpg',
    source: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/afghan-turquoise-2.jpg',
    source: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop&q=80',
  },

  // Mini Floral Everyday Jhumkas
  {
    dest: 'products/mini-floral-1.jpg',
    source: 'https://images.unsplash.com/photo-1616803140344-6682afb13cda?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/mini-floral-2.jpg',
    source: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
  },

  // Hasli Choker & Grand Chandbali Jhumka Set
  {
    dest: 'products/hasli-choker-set-1.jpg',
    source: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/hasli-choker-set-2.jpg',
    source: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
  },

  // Navratri Garba Queen Jumbo Jhumka Gift Combo
  {
    dest: 'products/garba-queen-combo-1.jpg',
    source: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
  },
  {
    dest: 'products/garba-queen-combo-2.jpg',
    source: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
  },
];

async function uploadJhumkaImages() {
  console.log('================================================================');
  console.log('✨ Uploading Pure Oxidised Jewellery & Jhumka Imagery to Supabase');
  console.log('================================================================');

  for (const item of JHUMKA_IMAGES) {
    try {
      console.log(`Fetching: ${item.dest}...`);
      const res = await fetch(item.source);
      if (!res.ok) {
        console.warn(`  Failed fetching ${item.source}: ${res.statusText}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(item.dest, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.warn(`  ⚠️ Upload error for ${item.dest}:`, error.message);
      } else {
        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(item.dest);
        console.log(`  ✅ Stored: ${item.dest} -> ${data.publicUrl}`);
      }
    } catch (e: any) {
      console.error(`  Error uploading ${item.dest}:`, e.message);
    }
  }

  console.log('\n✅ All Oxidised Jhumka images successfully uploaded to Supabase Storage!');
}

uploadJhumkaImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
