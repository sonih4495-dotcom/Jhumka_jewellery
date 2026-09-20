// scripts/migrate-to-supabase-storage.ts
import fs from 'fs';
import path from 'path';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { prisma } from '../lib/prisma';

const BUCKET = SUPABASE_STORAGE_BUCKET;

// Image mapping from source to Supabase storage destination
const REMOTE_IMAGES_TO_MIGRATE = [
  // Categories
  {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    dest: 'categories/rings.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    dest: 'categories/earrings.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    dest: 'categories/necklaces.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
    dest: 'categories/anklets.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
    dest: 'categories/bracelets.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    dest: 'categories/combos.jpg',
    contentType: 'image/jpeg',
  },

  // Products
  {
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    dest: 'products/chandbali-oxidised-silver-jhumkas-1.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    dest: 'products/chandbali-oxidised-silver-jhumkas-2.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    dest: 'products/dainty-solitaire-ring-1.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
    dest: 'products/dainty-solitaire-ring-2.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    dest: 'products/layered-evil-eye-pendant-1.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    dest: 'products/layered-evil-eye-pendant-2.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
    dest: 'products/boho-tribal-ghungroo-anklet-1.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    dest: 'products/boho-tribal-ghungroo-anklet-2.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    dest: 'products/garba-queen-festive-combo-1.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    dest: 'products/garba-queen-festive-combo-2.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
    dest: 'products/shimmering-charm-bracelet-1.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    dest: 'products/shimmering-charm-bracelet-2.jpg',
    contentType: 'image/jpeg',
  },

  // Vibes / Marketing
  {
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    dest: 'vibes/garba-glam.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    dest: 'vibes/minimal-daily.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    dest: 'vibes/date-night.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
    dest: 'vibes/evil-eye.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
    dest: 'vibes/bestie-gifting.jpg',
    contentType: 'image/jpeg',
  },

  // Avatars
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    dest: 'ui/avatar-ananya.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    dest: 'ui/avatar-priya.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    dest: 'ui/avatar-tanvi.jpg',
    contentType: 'image/jpeg',
  },
  {
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    dest: 'ui/avatar-sneha.jpg',
    contentType: 'image/jpeg',
  },
];

async function ensureBucketExists() {
  console.log(`📦 Checking Supabase Storage Bucket '${BUCKET}'...`);
  const { data: buckets, error: listError } =
    await supabaseAdmin.storage.listBuckets();

  if (listError) {
    throw new Error(`Failed to list buckets: ${listError.message}`);
  }

  const existing = buckets.find(b => b.name === BUCKET);
  if (!existing) {
    console.log(`Creating public bucket '${BUCKET}'...`);
    const { error: createError } = await supabaseAdmin.storage.createBucket(
      BUCKET,
      {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024, // 20MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/svg+xml',
          'application/json',
          'text/plain',
          'application/pdf',
        ],
      }
    );

    if (createError) {
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
    console.log(`✅ Bucket '${BUCKET}' created successfully with public access.`);
  } else {
    console.log(`✅ Bucket '${BUCKET}' already exists.`);
    if (!existing.public) {
      console.log(`Updating '${BUCKET}' to public...`);
      await supabaseAdmin.storage.updateBucket(BUCKET, { public: true });
    }
  }
}

async function uploadLocalImages() {
  console.log('\n📁 Uploading local static assets to Supabase Storage...');
  const publicImagesDir = path.join(process.cwd(), 'public', 'images');

  function scanDir(dir: string, baseSub = ''): { filePath: string; relPath: string }[] {
    const results: { filePath: string; relPath: string }[] = [];
    if (!fs.existsSync(dir)) return results;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relPath = baseSub ? `${baseSub}/${item.name}` : item.name;
      if (item.isDirectory()) {
        results.push(...scanDir(fullPath, relPath));
      } else {
        results.push({ filePath: fullPath, relPath });
      }
    }
    return results;
  }

  const files = scanDir(publicImagesDir);
  for (const file of files) {
    const ext = path.extname(file.filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    else if (ext === '.webp') contentType = 'image/webp';

    const fileBuffer = fs.readFileSync(file.filePath);
    const destPath = `brand/${file.relPath.replace(/\\/g, '/')}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(destPath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`⚠️ Failed uploading ${file.relPath}:`, error.message);
    } else {
      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(destPath);
      console.log(`  Uploaded ${destPath} -> ${data.publicUrl}`);
    }
  }
}

async function downloadAndUploadRemoteImages(): Promise<Map<string, string>> {
  console.log('\n🌐 Downloading and uploading jewellery images to Supabase Storage...');
  const urlMapping = new Map<string, string>();

  for (const item of REMOTE_IMAGES_TO_MIGRATE) {
    try {
      console.log(`  Fetching: ${item.dest}...`);
      const res = await fetch(item.url);
      if (!res.ok) {
        console.warn(`  Failed fetching ${item.url}: ${res.statusText}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(item.dest, buffer, {
          contentType: item.contentType,
          upsert: true,
        });

      if (error) {
        console.warn(`  ⚠️ Upload failed for ${item.dest}: ${error.message}`);
      } else {
        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(item.dest);
        urlMapping.set(item.url, data.publicUrl);
        urlMapping.set(item.dest, data.publicUrl);
        console.log(`  ✅ Stored: ${item.dest} -> ${data.publicUrl}`);
      }
    } catch (err: any) {
      console.error(`  Error processing ${item.dest}:`, err.message);
    }
  }

  return urlMapping;
}

async function exportAndUploadData() {
  console.log('\n💾 Exporting database tables and uploading data to Supabase Bucket...');

  try {
    const [categories, products, inventory, coupons, reviews, users] = await Promise.all([
      prisma.category.findMany(),
      prisma.product.findMany({ include: { images: true, variants: true } }),
      prisma.inventory.findMany(),
      prisma.coupon.findMany(),
      prisma.review.findMany(),
      prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, createdAt: true } }),
    ]);

    const backupData = {
      exportedAt: new Date().toISOString(),
      counts: {
        categories: categories.length,
        products: products.length,
        inventory: inventory.length,
        coupons: coupons.length,
        reviews: reviews.length,
        users: users.length,
      },
      categories,
      products,
      inventory,
      coupons,
      reviews,
      users,
    };

    const dataFiles = [
      { path: 'data/categories.json', content: JSON.stringify(categories, null, 2) },
      { path: 'data/products.json', content: JSON.stringify(products, null, 2) },
      { path: 'data/inventory.json', content: JSON.stringify(inventory, null, 2) },
      { path: 'data/coupons.json', content: JSON.stringify(coupons, null, 2) },
      { path: 'data/database_backup.json', content: JSON.stringify(backupData, null, 2) },
    ];

    for (const f of dataFiles) {
      const buffer = Buffer.from(f.content, 'utf-8');
      const { error } = await supabaseAdmin.storage.from(BUCKET).upload(f.path, buffer, {
        contentType: 'application/json',
        upsert: true,
      });

      if (error) {
        console.warn(`  ⚠️ Failed uploading ${f.path}:`, error.message);
      } else {
        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(f.path);
        console.log(`  ✅ Uploaded ${f.path} -> ${data.publicUrl}`);
      }
    }
  } catch (err: any) {
    console.error('Error exporting/uploading data:', err.message);
  }
}

async function updateDatabaseImageUrls(urlMap: Map<string, string>) {
  console.log('\n🔄 Updating Supabase PostgreSQL records with new Supabase bucket URLs...');

  try {
    // 1. Update Categories
    const categories = await prisma.category.findMany();
    for (const cat of categories) {
      let newUrl = urlMap.get(`categories/${cat.slug}.jpg`);
      if (!newUrl) {
        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(`categories/${cat.slug}.jpg`);
        newUrl = data.publicUrl;
      }
      if (newUrl) {
        await prisma.category.update({
          where: { id: cat.id },
          data: { image: newUrl },
        });
        console.log(`  Updated category '${cat.slug}' image to Supabase Bucket`);
      }
    }

    // 2. Update Product Images
    const productImages = await prisma.productImage.findMany({
      include: { product: true },
    });

    for (const img of productImages) {
      const slug = img.product.slug;
      const pos = img.position + 1;
      // Look for mapped URL or direct Supabase bucket URL
      const key = `products/${slug}-${pos}.jpg`;
      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
      const newUrl = urlMap.get(key) || data.publicUrl;

      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: newUrl },
      });
      console.log(`  Updated product image [${slug} pos ${img.position}] to Supabase Bucket`);
    }

    console.log('✅ Database image URLs updated to Supabase Storage Bucket.');
  } catch (err: any) {
    console.error('Error updating database image URLs:', err.message);
  }
}

async function verifySupabaseBucket() {
  console.log('\n🔍 Verifying all objects in Supabase Storage Bucket...');
  const prefixes = ['categories', 'products', 'vibes', 'ui', 'brand', 'data'];

  for (const prefix of prefixes) {
    const { data: list, error } = await supabaseAdmin.storage.from(BUCKET).list(prefix, {
      limit: 100,
    });
    if (error) {
      console.warn(`  Prefix '${prefix}' list error:`, error.message);
    } else {
      console.log(`  📁 '${prefix}/': ${list?.length || 0} files found:`);
      list?.slice(0, 5).forEach(f => console.log(`     - ${prefix}/${f.name} (${f.metadata?.size || 'unknown'} bytes)`));
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('🚀 Supabase Storage & Data Migration Pipeline');
  console.log('================================================================');

  await ensureBucketExists();
  await uploadLocalImages();
  const urlMap = await downloadAndUploadRemoteImages();
  await exportAndUploadData();
  await updateDatabaseImageUrls(urlMap);
  await verifySupabaseBucket();

  console.log('\n🎉 ALL IMAGES AND DATA ARE NOW STORED IN SUPABASE BUCKET!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
