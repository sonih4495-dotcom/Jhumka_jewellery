// File: app/(store)/category/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  getCategoryBySlug,
  getProductsByCategory,
} from '@/server/queries/products';
import { ProductCard } from '@/components/product-card';
import { ProductGrid } from '@/components/product-grid';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { SortSelect } from '@/components/sort-select';
import { FilterSidebar, MobileFilterDrawer } from '@/components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} | Products`,
    description:
      category.description ||
      `Shop ${category.name.toLowerCase()} products at great prices.`,
    openGraph: {
      title: `${category.name} Products`,
      description:
        category.description ||
        `Browse our ${category.name.toLowerCase()} collection`,
      type: 'website',
    },
  };
}

async function CategoryProductCount({ categoryId }: { categoryId: string }) {
  const result = await getProductsByCategory({
    categoryId,
    page: 1,
    limit: 1,
  });

  return (
    <Badge variant="secondary" className="ml-2 sm:ml-4 text-[10px] sm:text-xs">
      {result.total || 0} products
    </Badge>
  );
}

async function CategoryProducts({
  categoryId,
  searchParams,
}: {
  categoryId: string;
  searchParams: Awaited<CategoryPageProps['searchParams']>;
}) {
  const page = parseInt(searchParams.page || '1');
  const sort = searchParams.sort || 'newest';
  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;

  const result = await getProductsByCategory({
    categoryId,
    page,
    limit: 12,
    sort: sort as any,
    minPrice,
    maxPrice,
  });

  if (!result.products.length) {
    return (
      <div className="py-12 text-center rounded-2xl bg-white border border-stone-200 p-8 shadow-xs">
        <p className="text-sm font-semibold text-stone-700">
          No products found in this category matching your filters.
        </p>
        <Button asChild className="mt-4 rounded-xl bg-stone-900 text-white text-xs font-bold">
          <Link href="/products">Browse All Silver Drops</Link>
        </Button>
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
                href={`/category/${categoryId}?${new URLSearchParams({
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
                    href={`/category/${categoryId}?${new URLSearchParams({
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
                href={`/category/${categoryId}?${new URLSearchParams({
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

export default async function CategoryPage(props: CategoryPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

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
          <li>
            <Link href="/products" className="hover:text-stone-900 transition-colors">
              Drops
            </Link>
          </li>
          <li>/</li>
          <li className="font-semibold text-stone-900 truncate max-w-[200px]">{category.name}</li>
        </ol>
      </nav>

      {/* Category Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 font-display">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-1 text-xs sm:text-sm text-stone-500 font-sans">
                {category.description}
              </p>
            )}
          </div>
          <Suspense
            fallback={
              <Badge variant="secondary" className="ml-2 text-xs">
                Loading...
              </Badge>
            }
          >
            <CategoryProductCount categoryId={category.id} />
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
            <CategoryProducts
              categoryId={category.id}
              searchParams={searchParams}
            />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
