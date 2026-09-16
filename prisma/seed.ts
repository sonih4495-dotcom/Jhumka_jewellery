// Location: prisma/seed.ts
import { PrismaClient, UserRole, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Jhumka Junction Fashion & Oxidised Jewellery Database Seeding...');

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

  // 4. Create Categories
  const ringsCat = await prisma.category.create({
    data: {
      name: 'Statement Rings',
      slug: 'rings',
      description: 'Dainty, stackable, and adjustable fashion rings.',
      image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
    },
  });

  const earringsCat = await prisma.category.create({
    data: {
      name: 'Oxidised Earrings & Jhumkas',
      slug: 'earrings',
      description: 'Viral Chandbali jhumkas, lightweight studs, and Navratri oxidised statement drops.',
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
    },
  });

  const necklacesCat = await prisma.category.create({
    data: {
      name: 'Pendants & Chokers',
      slug: 'necklaces',
      description: 'Layered evil eye charms, choker sets, and college daily chains.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
    },
  });

  const ankletsCat = await prisma.category.create({
    data: {
      name: 'Ghungroo Payal (Anklets)',
      slug: 'anklets',
      description: 'Traditional tribal ghungroo anklets and sleek daily payal pairs.',
      image: 'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
    },
  });

  const braceletsCat = await prisma.category.create({
    data: {
      name: 'Charm Bracelets & Bangles',
      slug: 'bracelets',
      description: 'Aesthetic charm bracelets and adjustable open cuffs.',
      image: 'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
    },
  });

  const combosCat = await prisma.category.create({
    data: {
      name: 'Festive Gift Combos',
      slug: 'combos',
      description: 'Bestie twinning sets and complete Navratri jewellery gift boxes.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    },
  });

  console.log('✅ 6 Categories created.');

  // 5. Seed Products
  const productsData = [
    {
      name: 'Chandbali Oxidised Jhumkas',
      slug: 'chandbali-oxidised-silver-jhumkas',
      description: 'Iconic crescent-moon Chandbali jhumkas featuring delicate floral filigree and soft bell hangings. Crafted in premium antique oxidised metal with protective polish.',
      price: 1199,
      comparePrice: 1999,
      costPrice: 600,
      sku: 'JJ-EAR-001',
      status: ProductStatus.PUBLISHED,
      categoryId: earringsCat.id,
      material: 'Oxidised Alloy',
      silverPurity: 'Antique Finish',
      weight: 12.5,
      adjustability: 'Standard Post & Push Back',
      badge: 'BESTSELLER',
      vibe: 'Garba & Festive Glam',
      tags: ['garba', 'jhumka', 'oxidised', 'chandbali', 'navratri', 'statement'],
      images: [
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Dainty Sparkling Solitaire Adjustable Ring',
      slug: 'dainty-sparkling-925-solitaire-ring',
      description: 'A brilliant-cut AAA Zircon center stone embedded in polished silver-tone alloy with rhodium anti-tarnish coating. Features a free-size adjustable band.',
      price: 899,
      comparePrice: 1499,
      costPrice: 400,
      sku: 'JJ-RNG-001',
      status: ProductStatus.PUBLISHED,
      categoryId: ringsCat.id,
      material: 'Silver-Tone Alloy',
      silverPurity: 'AAA Zircon Polish',
      weight: 3.2,
      adjustability: 'Adjustable / Free Size',
      badge: 'NEW_DROP',
      vibe: 'Minimalist Everyday',
      tags: ['solitaire', 'ring', 'adjustable', 'college daily', 'zircon'],
      images: [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Layered Evil Eye Pendant & Chain',
      slug: 'layered-evil-eye-pure-silver-pendant',
      description: 'Ward off negative energy and look effortless with this handcrafted turquoise-enamel evil eye charm on an adjustable 16-18 inch delicate chain.',
      price: 1499,
      comparePrice: 2299,
      costPrice: 700,
      sku: 'JJ-NEC-001',
      status: ProductStatus.PUBLISHED,
      categoryId: necklacesCat.id,
      material: 'Brass & Enamel Alloy',
      silverPurity: 'Anti-Tarnish Polish',
      weight: 5.8,
      adjustability: '16 + 2 Inch Extender',
      badge: 'TRENDING',
      vibe: 'Evil Eye & Spiritual',
      tags: ['evil eye', 'pendant', 'chain', 'spiritual', 'aesthetic', 'daily glow'],
      images: [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Boho Tribal Ghungroo Anklet Pair',
      slug: 'boho-tribal-ghungroo-silver-anklet',
      description: 'Traditional Gujarati ghungroo payal with melodic soft chimes. Intricate tribal engraving in premium oxidised finish with secure S-hook closure.',
      price: 1799,
      comparePrice: 2599,
      costPrice: 850,
      sku: 'JJ-ANK-001',
      status: ProductStatus.PUBLISHED,
      categoryId: ankletsCat.id,
      material: 'Oxidised Alloy',
      silverPurity: 'Tribal Finish',
      weight: 22.0,
      adjustability: '9.5 + 1 Inch Extender',
      badge: 'BESTSELLER',
      vibe: 'Garba & Festive Glam',
      tags: ['payal', 'anklet', 'ghungroo', 'boho', 'gujarati', 'garba'],
      images: [
        'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Garba Queen Festive Gift Combo',
      slug: 'garba-queen-festive-gift-combo',
      description: 'The ultimate Navratri gifting box! Includes Chandbali Jhumkas, Ghungroo Payal, adjustable Nose Pin, and matching Boho ring in a signature pink gift box.',
      price: 3499,
      comparePrice: 5299,
      costPrice: 1800,
      sku: 'JJ-CMB-001',
      status: ProductStatus.PUBLISHED,
      categoryId: combosCat.id,
      material: 'Oxidised Jewellery Set',
      silverPurity: 'Artisan Finish',
      weight: 48.0,
      adjustability: 'Free Size Set',
      badge: 'BESTSELLER',
      vibe: 'Bestie Gifting Combos',
      isCombo: true,
      tags: ['combo', 'gift box', 'navratri set', 'bestie', 'garba queen', 'full set'],
      images: [
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      name: 'Shimmering Charm Bracelet',
      slug: 'shimmering-charm-bracelet',
      description: 'Handcrafted link bracelet with star and moon charms with sparkling crystal insets.',
      price: 1299,
      comparePrice: 1999,
      costPrice: 600,
      sku: 'JJ-BRC-001',
      status: ProductStatus.PUBLISHED,
      categoryId: braceletsCat.id,
      material: 'Polished Alloy',
      silverPurity: 'Rhodium Coating',
      weight: 6.5,
      adjustability: '7 + 1 Inch Extender',
      badge: 'NEW_DROP',
      vibe: 'Date Night Sparkle',
      tags: ['bracelet', 'charm', 'date night', 'crystals'],
      images: [
        'https://images.unsplash.com/photo-1611591475155-426477a20026?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
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
            isPrimary: index === 0,
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
    console.log(`✨ Seeded product: ${createdProduct.name}`);
  }

  // 6. Seed Promo Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'DRIP10',
        discountPercent: 10,
        minOrderAmount: 499,
        maxDiscount: 500,
        isActive: true,
      },
      {
        code: 'BESTIE20',
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
  });

  console.log('✅ Coupons seeded (DRIP10, BESTIE20, FESTIVE500).');
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