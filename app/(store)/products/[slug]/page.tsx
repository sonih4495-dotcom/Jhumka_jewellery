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
import { BuyNowButton } from '@/components/buy-now-button';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';
import { JsonLd } from '@/components/jsonld';
import { RingSizeGuideModal } from '@/components/ring-size-guide-modal';
import { ReferralModal } from '@/components/referral-modal';
import { MobileStickyCart } from '@/components/mobile-sticky-cart';
import { WishlistButton } from '@/components/wishlist-button';

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
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-stone-200/80 bg-stone-100 shadow-sm">
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
                <Badge className="bg-stone-900/90 backdrop-blur-md text-amber-300 border border-amber-400/30 font-bold text-xs px-3 py-1 rounded-full shadow-md">
                  ✨ {product.badge || 'Bestseller'}
                </Badge>
                {discountPercentage > 0 && (
                  <Badge className="bg-rani text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-md">
                    {discountPercentage}% OFF
                  </Badge>
                )}
              </div>

              {/* Wishlist Button */}
              <div className="absolute right-4 top-4 z-10">
                <WishlistButton productId={product.id} />
              </div>
              <div className="absolute bottom-4 left-4 z-10 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md border border-white/10">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                {product.silverPurity || 'Premium Quality Handcrafted'}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image: any, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-white hover:border-amber-400 transition-all cursor-pointer shadow-xs"
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
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  {product.category?.name || 'Handcrafted Jewellery'}
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-rani font-bold">
                  {product.material || 'Oxidised Silver Finish'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 leading-tight font-sans">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2 font-sans">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-stone-800">4.9</span>
                <span className="text-xs text-stone-400">({totalReviews} verified bestie reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="rounded-2xl bg-gradient-to-r from-amber-50/60 via-stone-50 to-pink-50/30 p-5 border border-stone-200/90 shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-stone-900 tracking-tight font-sans">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && Number(product.comparePrice) > Number(product.price) && (
                  <span className="text-base text-stone-400 line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="rounded-full bg-rani px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                    Save {discountPercentage}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5 flex flex-wrap items-center gap-1.5">
                <span>🛡️ Inclusive of 3% GST</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">FREE Pan-India Delivery on all orders</span>
              </p>
            </div>

            {/* Specifications Tag pills */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl border border-stone-200/80 p-3 bg-white shadow-xs">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Finish:</span>
                <span className="font-bold text-stone-900 mt-0.5 block">{product.silverPurity || 'Oxidised Antique'}</span>
              </div>
              <div className="rounded-2xl border border-stone-200/80 p-3 bg-white shadow-xs">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">Size / Fit:</span>
                <span className="font-bold text-stone-900 mt-0.5 block">{product.adjustability || 'Adjustable / Free Size'}</span>
              </div>
            </div>

            {/* Ring Size Guide (if applicable) */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-stone-500">Need sizing help?</span>
              <RingSizeGuideModal />
            </div>

            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              {product.description}
            </p>

            {/* Stock Availability Indicator */}
            {product.inventory && product.inventory[0] && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                {product.inventory[0].available > 0 ? (
                  <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({product.inventory[0].available} available for immediate dispatch)
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    Out of Stock — Handcrafting Next Batch
                  </span>
                )}
              </div>
            )}

            {/* Add to Cart & Buy Now CTA */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AddToCart
                  productId={product.id}
                  productName={product.name}
                  price={Number(product.price)}
                  comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                  image={product.images?.[0]?.url}
                  slug={product.slug}
                  maxQuantity={product.inventory?.[0]?.available ?? 10}
                  disabled={product.inventory && product.inventory[0] ? product.inventory[0].available <= 0 : false}
                  size="lg"
                  className="w-full rounded-2xl bg-stone-900 text-white hover:bg-black font-bold text-sm sm:text-base py-6 shadow-lg hover:shadow-stone-900/30 transition-all border border-stone-800"
                />

                <BuyNowButton
                  productId={product.id}
                  productName={product.name}
                  price={Number(product.price)}
                  comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
                  image={product.images?.[0]?.url}
                  slug={product.slug}
                  maxQuantity={product.inventory?.[0]?.available ?? 10}
                  disabled={product.inventory && product.inventory[0] ? product.inventory[0].available <= 0 : false}
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-stone-950 font-black text-sm sm:text-base py-6 shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-98 transition-all border-0"
                >
                  ⚡ Buy Now
                </BuyNowButton>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <WishlistButton productId={product.id} variant="full" className="py-5 rounded-2xl border-stone-200/90 shadow-xs hover:border-pink-300" />
                <ReferralModal trigger={
                  <Button variant="outline" size="sm" className="w-full rounded-2xl border-amber-200/90 bg-amber-50/60 text-amber-900 hover:bg-amber-100 text-xs py-5 font-bold shadow-xs">
                    <Gift className="mr-1.5 h-4 w-4 text-amber-600" /> Share &amp; Get ₹200
                  </Button>
                } />
              </div>
            </div>

            {/* Jhumka Junction Promises */}
            <div className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">100% Quality Guaranteed</strong>
                  <p className="text-stone-500 text-[11px]">Premium artisan craftsmanship &amp; antique polish.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-rani shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Anti-Tarnish &amp; Skin Friendly</strong>
                  <p className="text-stone-500 text-[11px]">Durable coating, nickel-free &amp; safe for daily wear.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Cash on Delivery &amp; Instant UPI</strong>
                  <p className="text-stone-500 text-[11px]">Pay online via GPay/PhonePe or at doorstep upon delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="specifications" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-stone-100 p-1">
              <TabsTrigger value="specifications" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm">
                Product Details
              </TabsTrigger>
              <TabsTrigger value="care" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm">
                Jewellery Care Guide
              </TabsTrigger>
              <TabsTrigger value="shipping" className="rounded-xl text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm">
                Shipping &amp; Returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="specifications" className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-500">Material</span>
                  <span className="font-bold text-stone-900">{product.material || 'Oxidised Silver Alloy'}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-500">Quality Finish</span>
                  <span className="font-bold text-stone-900">{product.silverPurity || 'Antique Oxidised'}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-500">Weight</span>
                  <span className="font-bold text-stone-900">{product.weight ? `${product.weight}g` : '4.2g (Approx)'}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-500">Fit / Adjustability</span>
                  <span className="font-bold text-stone-900">{product.adjustability || 'Adjustable / Free Size'}</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-500">Polish Coating</span>
                  <span className="font-bold text-stone-900">Anti-Tarnish Rhodium / Premium Oxidised</span>
                </div>
                <div className="flex justify-between border-b border-stone-100 py-2">
                  <span className="text-stone-500">Skin Compatibility</span>
                  <span className="font-bold text-emerald-700">100% Nickel & Lead Free</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="care" className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs text-xs text-stone-600 space-y-3">
              <p className="font-bold text-stone-900 text-sm">How to keep your Jhumka Junction shining forever ✨</p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                <li>Store in the airtight Jhumka Junction zip-lock pouch provided when not in use.</li>
                <li>Avoid spraying perfumes, body mists, or hairsprays directly onto the silver pieces.</li>
                <li>Gently wipe after use with a soft microfiber cloth to remove sweat or cosmetics.</li>
                <li>Oxidised silver has an artistic antique patina — do not scrub harshly with abrasive liquids.</li>
              </ul>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-xs text-xs text-stone-600 space-y-3">
              <p className="font-bold text-stone-900 text-sm">Insured Pan-India Delivery & Easy Returns 🚚</p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                <li><strong>Free Shipping</strong> across India on all orders.</li>
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
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                You Might Also Drip In ✨
              </h2>
              <Link href="/products" className="text-xs font-bold text-rani hover:underline">
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

      <MobileStickyCart
        productId={product.id}
        productName={product.name}
        price={Number(product.price)}
        comparePrice={product.comparePrice ? Number(product.comparePrice) : null}
        disabled={product.inventory && product.inventory[0] ? product.inventory[0].available <= 0 : false}
        maxQuantity={product.inventory?.[0]?.available ?? 10}
      />
    </>
  );
}