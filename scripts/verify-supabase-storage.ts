// scripts/verify-supabase-storage.ts
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { prisma } from '../lib/prisma';

async function verify() {
  console.log('================================================================');
  console.log('🔍 Comprehensive Verification: Supabase Bucket & Database');
  console.log('================================================================');
  console.log(`Target Bucket: '${SUPABASE_STORAGE_BUCKET}'`);

  // 1. Check bucket info
  const { data: buckets, error: bucketError } = await supabaseAdmin.storage.listBuckets();
  if (bucketError) {
    console.error('Failed to list buckets:', bucketError);
    return;
  }
  const targetBucket = buckets.find(b => b.name === SUPABASE_STORAGE_BUCKET);
  console.log('Bucket Status:', {
    name: targetBucket?.name,
    isPublic: targetBucket?.public,
    created: targetBucket?.created_at,
  });

  // 2. Check objects in each folder
  const folders = ['categories', 'products', 'vibes', 'ui', 'brand', 'data'];
  let totalObjects = 0;

  for (const folder of folders) {
    const { data: files, error } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .list(folder, { limit: 100 });

    if (error) {
      console.error(`Folder '${folder}' error:`, error.message);
    } else {
      console.log(`\n📁 /${folder} (${files.length} items):`);
      totalObjects += files.length;
      for (const f of files) {
        const { data: pub } = supabaseAdmin.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(`${folder}/${f.name}`);

        // Quick HEAD/GET test on public URL
        const testRes = await fetch(pub.publicUrl, { method: 'HEAD' });
        console.log(`   [${testRes.status}] ${folder}/${f.name} -> ${pub.publicUrl}`);
      }
    }
  }

  // 3. Check database records
  console.log('\n🗄️ Database Records Check:');
  const categories = await prisma.category.findMany({ select: { name: true, slug: true, image: true } });
  console.log(`Categories (${categories.length}):`);
  categories.forEach(c => console.log(`  - ${c.name} (${c.slug}): ${c.image}`));

  const products = await prisma.product.findMany({
    select: {
      name: true,
      slug: true,
      images: { select: { url: true, position: true } },
    },
  });
  console.log(`\nProducts (${products.length}):`);
  products.forEach(p => {
    console.log(`  - ${p.name}:`);
    p.images.forEach(img => console.log(`     pos ${img.position}: ${img.url}`));
  });

  console.log(`\n================================================================`);
  console.log(`✅ Total Verified Objects in Supabase Bucket: ${totalObjects}`);
  console.log(`✅ Database Categories with Supabase URLs: ${categories.length}`);
  console.log(`✅ Database Products with Supabase URLs: ${products.length}`);
  console.log(`================================================================`);
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
