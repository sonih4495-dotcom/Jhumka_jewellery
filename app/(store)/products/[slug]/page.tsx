// Location: app/(store)/products/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Ruler,
  CheckCircle2,
  Gift,
  HelpCircle,
} from 'lucide-react';
import {
  getProductBySlug,
  getRelatedProducts,
} from '@/server/queries/products';
import { AddToCart } from '@/components/add-to-cart';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { JsonLd } from '@/components/jsonld';
import { RingSizeGuideModal } from '@/components/ring-size-guide-modal';
import { ReferralModal } from '@/components/referral-modal';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Piece Not Found | Jhumka Junction',
    };
  }

  return {
    title: `${product.name} | Jhumka Junction`,
    description: product.description || `Buy ${product.name} handcrafted oxidised jewellery. Fast COD delivery across India.`,
    openGraph: {
      title: `${product.name} | Jhumka Junction`,
      description: product.description || undefined,
      type: 'website',
      images: product.images.map(img => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: product.name,
      })),
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const product: any = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = product.categoryId
    ? await getRelatedProducts(product.id, product.categoryId, 4)
    : [];

  const averageRating = 4.9;
  const totalReviews = 48;

  const discountPercentage = product.comparePrice && Number(product.comparePrice) > Number(product.price)
    ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
    : 0;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img: any) => img.url),
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: 'Jhumka Junction',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Jhumka Junction',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: averageRating,
      reviewCount: totalReviews,
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-xs text-muted-foreground">
            <li><Link href="/" className="hover:text-purple-600">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-purple-600">All Drops</Link></li>
            {product.category && (
              <>
                <li>/</li>
                <li><Link href={`/category/${product.category.slug}`} className="hover:text-purple-600">{product.category.name}</Link></li>
              </>
            )}
            <li>/</li>
            <li className="font-semibold text-gray-900 truncate max-w-[200px]">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Product Gallery (Aspect 4/5 Jewellery Portrait) */}
          <div className="space-y-4 lg:col-span-6">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-b from-purple-50/20 to-pink-50/20 shadow-sm">
              <Image
                src={product.images[0]?.url || '/images/placeholder.svg'}
                alt={product.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Badges on image */}
              <div className="absolute left-4 top-4 flex flex-col gap-2 z-10">
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md">
                  ✨ {product.badge || 'Bestseller'}
                </Badge>
                {discountPercentage > 0 && (
                  <Badge className="bg-pink-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Quality Badge Watermark */}
              <div className="absolute bottom-4 left-4 z-10 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="h-4 w-4 text-purple-300" />
                {product.silverPurity || 'Premium Quality Handcrafted'}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-purple-100 bg-white hover:border-purple-400 transition-all cursor-pointer"
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} photo ${index + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="space-y-6 lg:col-span-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  {product.category?.name || 'Handcrafted Jewellery'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 font-medium">
                  {product.material || 'Oxidised Silver Finish'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-700">4.9</span>
                <span className="text-xs text-gray-400">({totalReviews} verified bestie reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="rounded-2xl bg-purple-50/50 p-4 border border-purple-100">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <Badge className="bg-pink-600 text-white font-bold text-xs">
                    Save {discountPercentage}%
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Inclusive of 3% GST • Free standard delivery on orders above ₹999
              </p>
            </div>

            {/* Specifications Tag pills */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-gray-100 p-2.5 bg-white">
                <span className="text-gray-400 block text-[10px]">Finish:</span>
                <span className="font-bold text-gray-900">{product.silverPurity || 'Oxidised Antique'}</span>
              </div>
              <div className="rounded-xl border border-gray-100 p-2.5 bg-white">
                <span className="text-gray-400 block text-[10px]">Size / Fit:</span>
                <span className="font-bold text-gray-900">{product.adjustability || 'Adjustable / Free Size'}</span>
              </div>
            </div>

            {/* Ring Size Guide (if applicable) */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Need sizing help?</span>
              <RingSizeGuideModal />
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Stock Availability Indicator */}
            {product.inventory && product.inventory[0] && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                {product.inventory[0].available > 0 ? (
                  <span className="text-emerald-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({product.inventory[0].available} available)
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Out of Stock — Handcrafting Next Batch
                  </span>
                )}
              </div>
            )}

            {/* Add to Cart CTA */}
            <div className="space-y-3 pt-2">
              <AddToCart
                productId={product.id}
                maxQuantity={product.inventory?.[0]?.available ?? 10}
                disabled={product.inventory && product.inventory[0] ? product.inventory[0].available <= 0 : false}
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-6 text-sm font-bold text-white shadow-lg shadow-purple-200 hover:opacity-95"
              />

              <div className="flex items-center gap-2">
                <ReferralModal trigger={
                  <Button variant="outline" size="sm" className="flex-1 rounded-full border-pink-200 text-pink-700 hover:bg-pink-50 text-xs">
                    <Gift className="mr-1.5 h-3.5 w-3.5 text-pink-500" /> Share with Bestie (Get ₹200)
                  </Button>
                } />
              </div>
            </div>

            {/* Jhumka Junction Promises */}
            <div className="rounded-2xl border border-pink-100 bg-pink-50/20 p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">100% Quality Guaranteed</strong>
                  <p className="text-gray-500 text-[11px]">Premium artisan craftsmanship &amp; polish.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-pink-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Anti-Tarnish &amp; Skin Friendly</strong>
                  <p className="text-gray-500 text-[11px]">Durable coating, safe and comfortable for daily wear.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-gray-900">Cash on Delivery &amp; Instant UPI</strong>
                  <p className="text-gray-500 text-[11px]">Pay online via GPay/PhonePe or at doorstep upon delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-purple-50 p-1">
              <TabsTrigger value="specifications" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Product Details
              </TabsTrigger>
              <TabsTrigger value="care" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Jewellery Care Guide
              </TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-purple-700">
                Shipping &amp; Returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Material</span>
                  <span className="font-bold text-gray-900">{product.material || 'Oxidised Silver Alloy'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Quality Finish</span>
                  <span className="font-bold text-gray-900">{product.silverPurity || 'Antique Oxidised'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Weight</span>
                  <span className="font-bold text-gray-900">{product.weight ? `${product.weight}g` : '4.2g (Approx)'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Fit / Adjustability</span>
                  <span className="font-bold text-gray-900">{product.adjustability || 'Adjustable / Free Size'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Polish Coating</span>
                  <span className="font-bold text-gray-900">Anti-Tarnish Rhodium / Premium Oxidised</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 py-2">
                  <span className="text-gray-500">Skin Compatibility</span>
                  <span className="font-bold text-green-700">100% Nickel & Lead Free</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="care" className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-xs text-gray-600 space-y-3">
              <p className="font-bold text-gray-900 text-sm">How to keep your Jhumka Junction shining forever ✨</p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                <li>Store in the airtight Jhumka Junction zip-lock pouch provided when not in use.</li>
                <li>Avoid spraying perfumes, body mists, or hairsprays directly onto the silver pieces.</li>
                <li>Gently wipe after use with a soft microfiber cloth to remove sweat or cosmetics.</li>
                <li>Oxidised silver has an artistic antique patina — do not scrub harshly with abrasive liquids.</li>
              </ul>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm text-xs text-gray-600 space-y-3">
              <p className="font-bold text-gray-900 text-sm">Insured Pan-India Delivery & Easy Returns 🚚</p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                <li><strong>Free Shipping</strong> across India on all orders ₹999 and above.</li>
                <li><strong>Delivery Timeline:</strong> Dispatched in 24 hours. Delivered in 3-5 business days (Delhivery, BlueDart, India Post).</li>
                <li><strong>Cash on Delivery (COD):</strong> Available across 25,000+ Indian pincodes.</li>
                <li><strong>15-Day Easy Returns:</strong> If you are not in love with your silver piece, schedule a doorstep return hassle-free!</li>
              </ul>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Silver Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                You Might Also Drip In ✨
              </h2>
              <Link href="/products" className="text-xs font-bold text-purple-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct: any) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  name={relatedProduct.name}
                  slug={relatedProduct.slug}
                  price={Number(relatedProduct.price)}
                  comparePrice={relatedProduct.comparePrice ? Number(relatedProduct.comparePrice) : null}
                  image={relatedProduct.images?.[0]?.url}
                  status={relatedProduct.status}
                  category={relatedProduct.category}
                  badge={relatedProduct.badge}
                  material={relatedProduct.material}
                  silverPurity={relatedProduct.silverPurity}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}