import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from '../lib/supabase';
import { prisma } from '../lib/prisma';

async function main() {
  const [categories, products, inventory, coupons] = await Promise.all([
    prisma.category.findMany(),
    prisma.product.findMany({ include: { images: true } }),
    prisma.inventory.findMany(),
    prisma.coupon.findMany(),
  ]);

  const backup = {
    exportedAt: new Date().toISOString(),
    categories,
    products,
    inventory,
    coupons,
  };

  const files = [
    { name: 'data/categories.json', data: JSON.stringify(categories, null, 2) },
    { name: 'data/products.json', data: JSON.stringify(products, null, 2) },
    { name: 'data/inventory.json', data: JSON.stringify(inventory, null, 2) },
    { name: 'data/coupons.json', data: JSON.stringify(coupons, null, 2) },
    { name: 'data/database_backup.json', data: JSON.stringify(backup, null, 2) },
  ];

  for (const f of files) {
    const buf = Buffer.from(f.data, 'utf-8');
    const { error } = await supabaseAdmin.storage.from(SUPABASE_STORAGE_BUCKET).upload(f.name, buf, {
      contentType: 'application/json',
      upsert: true,
    });
    console.log('Exported and stored', f.name, error ? error.message : 'OK');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
