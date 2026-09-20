// File: app/(store)/products/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getAllProductsPaginated } from '@/server/queries/products';
import { ProductGrid } from '@/components/product-grid';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { SortSelect } from '@/components/sort-select';
import { FilterSidebar, MobileFilterDrawer } from '@/components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductsPageProps {
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Browse our full catalog of products at great prices.',
  openGraph: {
    title: 'All Products',
    description: 'Browse our full catalog of products at great prices.',
    type: 'website',
  },
};

async function ProductsCount({
  searchParams,
}: {
  searchParams: Awaited<ProductsPageProps['searchParams']>;
}) {
  const result = await getAllProductsPaginated({
    page: 1,
    limit: 1,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
  });

  return (
    <Badge variant="secondary" className="ml-2 sm:ml-4 text-[10px] sm:text-xs">
      {result.total || 0} products
    </Badge>
  );
}

async function AllProducts({
  searchParams,
}: {
  searchParams: Awaited<ProductsPageProps['searchParams']>;
}) {
  const page = parseInt(searchParams.page || '1');
  const sort = searchParams.sort || 'newest';
  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;

  const result = await getAllProductsPaginated({
    page,
    limit: 12,
    sort,
    minPrice,
    maxPrice,
  });

  if (!result.products.length) {
    return (
      <div className="py-12 text-center rounded-2xl bg-white border border-stone-200 p-8 shadow-xs">
        <p className="text-sm font-semibold text-stone-700">No products match your current filters.</p>
        <p className="text-xs text-stone-400 mt-1">Try clearing or adjusting your price filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs sm:text-sm text-stone-500 font-sans">
          Showing {(page - 1) * 12 + 1}-{Math.min(page * 12, result.total)} of{' '}
          {result.total} drops
        </p>
        <div className="flex items-center gap-2 ml-auto">
          <MobileFilterDrawer />
          <SortSelect />
        </div>
      </div>

      <ProductGrid products={result.products} />

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-4">
          {page > 1 && (
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link
                href={`/products?${new URLSearchParams({
                  ...searchParams,
                  page: (page - 1).toString(),
                })}`}
              >
                Previous
              </Link>
            </Button>
          )}

          <div className="flex items-center space-x-1.5">
            {Array.from({ length: Math.min(5, result.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === page;

              return (
                <Button
                  key={pageNum}
                  asChild
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-xl text-xs h-8 w-8 p-0"
                >
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...searchParams,
                      page: pageNum.toString(),
                    })}`}
                  >
                    {pageNum}
                  </Link>
                </Button>
              );
            })}
          </div>

          {page < result.totalPages && (
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link
                href={`/products?${new URLSearchParams({
                  ...searchParams,
                  page: (page + 1).toString(),
                })}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default async function ProductsPage(props: ProductsPageProps) {
  const searchParams = await props.searchParams;

  return (
    <div className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 lg:px-8 sm:py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-xs text-stone-500">
          <li>
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-stone-900">All Silver Drops</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 font-display">
              All Jewellery Drops ✨
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-sans">
              Handcrafted oxidised statement pieces, chandbalis, and festive combos.
            </p>
          </div>
          <Suspense
            fallback={
              <Badge variant="secondary" className="ml-2 text-xs">
                Loading...
              </Badge>
            }
          >
            <ProductsCount searchParams={searchParams} />
          </Suspense>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar - Desktop Only */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <FilterSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Suspense fallback={<ProductGridSkeleton />}>
            <AllProducts searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
