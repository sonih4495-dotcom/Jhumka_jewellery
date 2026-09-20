import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { prisma } from '../lib/prisma';

async function main() {
  const folders = ['categories', 'products', 'vibes', 'ui', 'brand', 'data'];
  console.log(`=== SUPABASE STORAGE BUCKET: '${SUPABASE_STORAGE_BUCKET}' ===`);

  for (const f of folders) {
    const { data, error } = await supabaseAdmin.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .list(f);

    if (error) {
      console.log(`Error in folder '${f}':`, error.message);
    } else {
      console.log(`📁 /${f} (${data.length} files):`);
      data.forEach(item => {
        const { data: pub } = supabaseAdmin.storage
          .from(SUPABASE_STORAGE_BUCKET)
          .getPublicUrl(`${f}/${item.name}`);
        console.log(`  - ${f}/${item.name} (${item.metadata?.size || 'unknown'} bytes) -> ${pub.publicUrl}`);
      });
    }
  }

  console.log('\n=== SUPABASE POSTGRESQL DATABASE ===');
  const cats = await prisma.category.findMany({ select: { name: true, image: true } });
  console.log(`Categories (${cats.length}):`);
  cats.forEach(c => console.log(`  - ${c.name}: ${c.image}`));

  const prods = await prisma.product.findMany({
    select: { name: true, images: { select: { url: true } } },
  });
  console.log(`\nProducts (${prods.length}):`);
  prods.forEach(p => {
    console.log(`  - ${p.name}:`);
    p.images.forEach(img => console.log(`     ${img.url}`));
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
