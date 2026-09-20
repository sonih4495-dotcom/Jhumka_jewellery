// Location: prisma/seed.ts
import { PrismaClient, UserRole, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SUPABASE_STORAGE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'jewellery'}`
  : 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery';

async function main() {
  console.log('🌱 Starting Jhumka Junction - Pure Oxidised Jewellery & Jhumka Database Seeding...');
  console.log(`📦 Using Supabase Storage: ${SUPABASE_STORAGE_URL}`);

  // 1. Clean existing products and categories
  await prisma.review.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.coupon.deleteMany({});

  // 2. Upsert Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { role: UserRole.ADMIN, password: adminPassword },
    create: {
      email: 'admin@example.com',
      name: 'Jhumka Junction Admin',
      role: UserRole.ADMIN,
      password: adminPassword,
      phone: '+919876543210',
    },
  });
  console.log('✅ Admin user created/updated:', admin.email);

  // 3. Upsert Demo Customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'ananya.deshmukh@gmail.com' },
    update: { password: customerPassword },
    create: {
      email: 'ananya.deshmukh@gmail.com',
      name: 'Ananya Deshmukh',
      role: UserRole.USER,
      password: customerPassword,
      phone: '+919820098200',
    },
  });
  console.log('✅ Demo Customer created:', customer.email);

  // 4. Create Dedicated Oxidised Jhumka Categories
  const chandbaliCat = await prisma.category.create({
    data: {
      name: 'Chandbali Jhumkas',
      slug: 'chandbali-jhumkas',
      description: 'Iconic royal crescent-moon oxidised chandelier drops with soft bell clusters.',
      image: `${SUPABASE_STORAGE_URL}/categories/chandbali-jhumkas.jpg`,
    },
  });

  const domeTempleCat = await prisma.category.create({
    data: {
      name: 'Dome Temple Jhumkas',
      slug: 'dome-temple-jhumkas',
      description: 'Traditional South Indian and temple dome bells with melodic ghungroo chimes.',
      image: `${SUPABASE_STORAGE_URL}/categories/dome-temple-jhumkas.jpg`,
    },
  });

  const kashmiriAfghanCat = await prisma.category.create({
    data: {
      name: 'Kashmiri & Afghan Jhumkas',
      slug: 'kashmiri-afghan-jhumkas',
      description: 'Bohemian shoulder-dusters with tribal mirrors, vintage coins, and turquoise stone insets.',
      image: `${SUPABASE_STORAGE_URL}/categories/kashmiri-afghan-jhumkas.jpg`,
    },
  });

  const peacockCat = await prisma.category.create({
    data: {
      name: 'Peacock & Floral Jhumkas',
      slug: 'peacock-floral-jhumkas',
      description: 'Intricately handcrafted antique filigree motifs with twin bell hangings.',
      image: `${SUPABASE_STORAGE_URL}/categories/peacock-floral-jhumkas.jpg`,
    },
  });

  const miniDailyCat = await prisma.category.create({
    data: {
      name: 'Mini Everyday Jhumkas',
      slug: 'mini-everyday-jhumkas',
      description: 'Featherlight oxidised studs and mini drops for college and daily office wear.',
      image: `${SUPABASE_STORAGE_URL}/categories/mini-everyday-jhumkas.jpg`,
    },
  });

  const combosCat = await prisma.category.create({
    data: {
      name: 'Festive Jhumka Combos & Sets',
      slug: 'festive-jhumka-combos',
      description: 'Complete Navratri gifting boxes and grand Hasli choker + statement jhumka sets.',
      image: `${SUPABASE_STORAGE_URL}/categories/festive-jhumka-combos.jpg`,
    },
  });

  console.log('✅ 6 Dedicated Oxidised Jhumka Categories created.');

  // 5. Seed Authentic Handcrafted Oxidised Jhumka Products
  const productsData = [
    {
      name: 'Royal Chandbali Oxidised Silver Jhumkas',
      slug: 'royal-chandbali-oxidised-jhumkas',
      description: 'Handcrafted crescent-moon Chandbali jhumkas featuring delicate floral filigree, antique oxidised silver polish, and melodic bell drops. The iconic Navratri & wedding festival statement.',
      price: 1299,
      comparePrice: 2199,
      costPrice: 550,
      sku: 'JJ-JHM-001',
      status: ProductStatus.PUBLISHED,
      categoryId: chandbaliCat.id,
      material: 'Antique Oxidised Silver Alloy',
      silverPurity: 'Anti-Tarnish Polish',
      weight: 16.5,
      adjustability: 'Standard Post & Push Back',
      badge: 'BESTSELLER',
      vibe: 'Garba & Festive Glam',
      tags: ['chandbali', 'jhumka', 'oxidised', 'garba', 'navratri', 'statement earring'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/royal-chandbali-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/royal-chandbali-2.jpg`,
      ],
    },
    {
      name: 'Kashmiri Long Mirror-Work Tribal Jhumkas',
      slug: 'kashmiri-long-tribal-jhumkas',
      description: 'Vintage shoulder-dusting tribal jhumkas hand-set with circular mirrors and tiered oxidised bells that reflect festive lights gorgeously. Lightweight hollow-cast structure for painless all-night wear.',
      price: 1699,
      comparePrice: 2699,
      costPrice: 750,
      sku: 'JJ-JHM-002',
      status: ProductStatus.PUBLISHED,
      categoryId: kashmiriAfghanCat.id,
      material: 'Oxidised Tribal Brass Alloy',
      silverPurity: 'Vintage Mirror Insets',
      weight: 24.0,
      adjustability: 'Fish Hook Wire Fitting',
      badge: 'VIRAL_ON_REELS',
      vibe: 'Garba & Festive Glam',
      tags: ['kashmiri', 'tribal', 'mirror work', 'shoulder duster', 'jhumka', 'boho'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/kashmiri-tribal-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/kashmiri-tribal-2.jpg`,
      ],
    },
    {
      name: 'Peacock Filigree Dual Dome Jhumkas',
      slug: 'peacock-filigree-dual-dome-jhumkas',
      description: 'Artisan carved dancing peacock crest supporting a tiered double bell dome with micro-pearl detailing and antique black patina polish.',
      price: 1499,
      comparePrice: 2399,
      costPrice: 650,
      sku: 'JJ-JHM-003',
      status: ProductStatus.PUBLISHED,
      categoryId: peacockCat.id,
      material: 'Oxidised Antique Alloy',
      silverPurity: 'Handcrafted Filigree',
      weight: 18.2,
      adjustability: 'Push Back with Comfort Pad',
      badge: 'TRENDING',
      vibe: 'Date Night Sparkle',
      tags: ['peacock', 'filigree', 'double dome', 'jhumki', 'ethnic chic', 'royal'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/peacock-jhumka-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/peacock-jhumka-2.jpg`,
      ],
    },
    {
      name: 'Traditional Gujarati Ghungroo Dome Jhumkas',
      slug: 'gujarati-ghungroo-dome-jhumkas',
      description: 'Authentic Gujarati garba jhumkas surrounded by 24 hand-tied brass ghungroo beads that ring with a sweet melodic chime with every step.',
      price: 1399,
      comparePrice: 2299,
      costPrice: 600,
      sku: 'JJ-JHM-004',
      status: ProductStatus.PUBLISHED,
      categoryId: domeTempleCat.id,
      material: 'Oxidised Alloy with Ghungroo Bells',
      silverPurity: 'Matte Antique Finish',
      weight: 19.5,
      adjustability: 'Standard Post & Push Back',
      badge: 'BESTSELLER',
      vibe: 'Garba & Festive Glam',
      tags: ['ghungroo', 'gujarati', 'temple dome', 'jhumka', 'navratri classic', 'chimes'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/gujarati-ghungroo-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/gujarati-ghungroo-2.jpg`,
      ],
    },
    {
      name: 'Afghan Coin & Turquoise Tribal Jhumkas',
      slug: 'afghan-turquoise-tribal-jhumkas',
      description: 'Distinctive nomadic Afghan jhumkas adorned with raw turquoise cabochon stones, repoussé coin charms, and antique tribal silver hangings.',
      price: 1599,
      comparePrice: 2499,
      costPrice: 700,
      sku: 'JJ-JHM-005',
      status: ProductStatus.PUBLISHED,
      categoryId: kashmiriAfghanCat.id,
      material: 'Afghan Tribal Silver Alloy',
      silverPurity: 'Natural Turquoise Stones',
      weight: 21.0,
      adjustability: 'S-Hook Wire Clasp',
      badge: 'NEW_DROP',
      vibe: 'Evil Eye & Spiritual',
      tags: ['afghan', 'turquoise', 'coin jhumka', 'boho silver', 'nomadic jewellery'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/afghan-turquoise-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/afghan-turquoise-2.jpg`,
      ],
    },
    {
      name: 'Mini Floral Lightweight Daily Jhumkas',
      slug: 'mini-everyday-jhumkas',
      description: 'Charming mini oxidised flower stud flowing into a delicate bell. Weighs under 7 grams, crafted specially for comfortable all-day college, kurtis, and office wear.',
      price: 799,
      comparePrice: 1299,
      costPrice: 320,
      sku: 'JJ-JHM-006',
      status: ProductStatus.PUBLISHED,
      categoryId: miniDailyCat.id,
      material: 'Lightweight Oxidised Alloy',
      silverPurity: 'Hypoallergenic Post',
      weight: 6.8,
      adjustability: 'Push Back with Silicone Stopper',
      badge: 'NEW_DROP',
      vibe: 'Minimalist Everyday',
      tags: ['mini jhumka', 'daily wear', 'lightweight', 'college girl', 'office ethnic'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/mini-floral-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/mini-floral-2.jpg`,
      ],
    },
    {
      name: 'Hasli Choker & Grand Chandbali Jhumka Set',
      slug: 'hasli-choker-grand-jhumka-set',
      description: 'The ultimate royal oxidised set! Hand-forged rigid silver hasli neck collar paired with matching jumbo Chandbali jhumkas with hanging pearl drops.',
      price: 2899,
      comparePrice: 4599,
      costPrice: 1400,
      sku: 'JJ-SET-001',
      status: ProductStatus.PUBLISHED,
      categoryId: combosCat.id,
      material: 'Oxidised Silver Finish Set',
      silverPurity: 'Handcrafted Heritage Quality',
      weight: 52.0,
      adjustability: 'Adjustable Cotton Thread Dori Choker',
      badge: 'BESTSELLER',
      vibe: 'Garba & Festive Glam',
      isCombo: true,
      tags: ['hasli set', 'choker set', 'chandbali jhumkas', 'royal set', 'bridal oxidised'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/hasli-choker-set-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/hasli-choker-set-2.jpg`,
      ],
    },
    {
      name: 'Navratri Garba Queen Jumbo Jhumka Gift Combo',
      slug: 'garba-queen-jumbo-jhumka-combo',
      description: 'Signature pink velvet festive gift box containing Jumbo 3-Tier Chandbali Jhumkas, matching adjustable Peacock Ring, clip-on Nose Pin, and micro-cloth jewelry care kit.',
      price: 3499,
      comparePrice: 5499,
      costPrice: 1800,
      sku: 'JJ-CMB-001',
      status: ProductStatus.PUBLISHED,
      categoryId: combosCat.id,
      material: 'Complete Oxidised Jewellery Gift Box',
      silverPurity: 'Premium Artisan Finish',
      weight: 48.0,
      adjustability: 'Free Size Combo Set',
      badge: 'BESTSELLER',
      vibe: 'Bestie Gifting Combos',
      isCombo: true,
      tags: ['combo box', 'garba queen', 'gift box', 'jumbo jhumka', 'nose pin', 'ring combo'],
      images: [
        `${SUPABASE_STORAGE_URL}/products/garba-queen-combo-1.jpg`,
        `${SUPABASE_STORAGE_URL}/products/garba-queen-combo-2.jpg`,
      ],
    },
  ];

  for (const item of productsData) {
    const { images, ...productData } = item;
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        images: {
          create: images.map((url, index) => ({
            url,
            position: index,
          })),
        },
        inventory: {
          create: {
            quantity: 50,
            available: 50,
            reserved: 0,
          },
        },
      },
    });
    console.log(`✨ Seeded Jhumka product: ${createdProduct.name} (${createdProduct.slug})`);
  }

  // 6. Seed Promo Coupons
  try {
    await prisma.coupon.createMany({
      data: [
        {
          code: 'JHUMKA10',
          discountPercent: 10,
          minOrderAmount: 499,
          maxDiscount: 500,
          isActive: true,
        },
        {
          code: 'GARBA20',
          discountPercent: 20,
          minOrderAmount: 999,
          maxDiscount: 1000,
          isActive: true,
        },
        {
          code: 'FESTIVE500',
          discountAmount: 500,
          minOrderAmount: 1999,
          isActive: true,
        },
      ],
      skipDuplicates: true,
    });
    console.log('✅ Coupons seeded (JHUMKA10, GARBA20, FESTIVE500).');
  } catch (couponErr: any) {
    console.warn('⚠️ Coupons seeding note:', couponErr?.message || couponErr);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });