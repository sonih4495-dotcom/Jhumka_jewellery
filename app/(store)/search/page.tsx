// File: app/(store)/search/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { searchProducts } from '@/server/queries/products';
import { ProductGrid } from '@/components/product-grid';
import { ProductGridSkeleton } from '@/components/product-grid-skeleton';
import { SortSelect } from '@/components/sort-select';
import { FilterSidebar, MobileFilterDrawer } from '@/components/filter-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

const TRENDING_SEARCHES = [
  { label: 'Royal Chandbali', emoji: '🌙', q: 'Chandbali' },
  { label: 'Temple Ghungroo', emoji: '🔔', q: 'Temple' },
  { label: 'Kashmiri Tribal', emoji: '✨', q: 'Kashmiri' },
  { label: 'Peacock Filigree', emoji: '🦚', q: 'Peacock' },
  { label: 'Mini Daily Wear', emoji: '🌸', q: 'Mini' },
  { label: 'Festive Combos', emoji: '🎁', q: 'Combo' },
  { label: 'Statement Rings', emoji: '💍', q: 'Ring' },
];

const SEARCH_CATEGORIES = [
  { name: 'Chandbali Jhumkas', slug: 'chandbali-jhumkas', emoji: '🌙', count: 'Royal Drops' },
  { name: 'Temple Dome Jhumkas', slug: 'dome-temple-jhumkas', emoji: '🔔', count: 'Melodic Bells' },
  { name: 'Kashmiri & Afghan', slug: 'kashmiri-afghan-jhumkas', emoji: '✨', count: 'Tribal Mirrors' },
  { name: 'Peacock Filigree', slug: 'peacock-floral-jhumkas', emoji: '🦚', count: 'Handcrafted' },
  { name: 'Mini Everyday Drops', slug: 'mini-everyday-jhumkas', emoji: '🌸', count: 'College Wear' },
  { name: 'Festive Gift Combos', slug: 'festive-jhumka-combos', emoji: '🎁', count: 'Gift Sets' },
];

export async function generateMetadata(props: SearchPageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';

  if (!query) {
    return {
      title: 'Search Handcrafted Jewellery | Jhumka Junction',
      description: 'Search through our curated collection of oxidised jhumkas, rings, and festive gift combos.',
    };
  }

  return {
    title: `Search: "${query}" | Jhumka Junction`,
    description: `Find handcrafted jewellery matching "${query}". Authentic oxidised silver pieces with free shipping.`,
    openGraph: {
      title: `Search: ${query}`,
      description: `Search results for "${query}"`,
      type: 'website',
    },
  };
}

// Full-width empty state when no search query has been submitted yet
function SearchLanding() {
  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Trending Tags Section */}
      <div className="rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3.5 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Trending Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRENDING_SEARCHES.map(item => (
            <Link
              key={item.q}
              href={`/search?q=${encodeURIComponent(item.q)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 transition-all hover:bg-stone-900 hover:text-white hover:border-stone-900 active:scale-95"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Explore Popular Categories Grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-stone-900 font-display">
            Browse Popular Categories 💍
          </h2>
          <Link href="/products" className="text-xs font-bold text-rani hover:underline">
            View All Drops →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SEARCH_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-stone-200/90 bg-white p-4 text-center shadow-xs transition-all hover:-translate-y-1 hover:border-amber-400 hover:shadow-md"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </span>
              <p className="text-xs font-bold text-stone-900 group-hover:text-rani transition-colors line-clamp-1">
                {cat.name}
              </p>
              <p className="text-[10px] text-stone-400 mt-0.5">{cat.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Awaited<SearchPageProps['searchParams']>;
}) {
  const query = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');
  const sort = searchParams.sort || 'relevance';
  const categoryFilter = searchParams.category;
  const minPrice = searchParams.minPrice
    ? parseFloat(searchParams.minPrice)
    : undefined;
  const maxPrice = searchParams.maxPrice
    ? parseFloat(searchParams.maxPrice)
    : undefined;

  const result = await searchProducts({
    query,
    page,
    limit: 12,
    sort: sort as any,
    categoryFilter,
    minPrice,
    maxPrice,
  });

  if (!result.products.length) {
    return (
      <div className="py-12 text-center rounded-3xl border border-stone-200/90 bg-white p-8 shadow-xs space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
          <Search className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 font-display">
            No drops found for "{query}"
          </h2>
          <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't find exact matches. Try checking your spelling, using broader terms, or exploring our trending categories below.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap justify-center gap-2">
          {TRENDING_SEARCHES.slice(0, 4).map(item => (
            <Link
              key={item.q}
              href={`/search?q=${encodeURIComponent(item.q)}`}
              className="rounded-full bg-stone-50 border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-900 hover:text-white"
            >
              {item.emoji} {item.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs sm:text-sm text-stone-500 font-sans">
          Showing {(page - 1) * 12 + 1}-
          {Math.min(page * 12, result.pagination.total)} of{' '}
          {result.pagination.total} results for <strong className="text-stone-900">"{query}"</strong>
        </p>
        <div className="flex items-center gap-2 ml-auto">
          <MobileFilterDrawer />
          <SortSelect />
        </div>
      </div>

      <ProductGrid products={result.products} />

      {/* Pagination */}
      {result.pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 pt-4">
          {page > 1 && (
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link
                href={`/search?${new URLSearchParams({
                  ...searchParams,
                  page: (page - 1).toString(),
                })}`}
              >
                Previous
              </Link>
            </Button>
          )}

          <div className="flex items-center space-x-1.5">
            {Array.from(
              { length: Math.min(5, result.pagination.pages) },
              (_, i) => {
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
                      href={`/search?${new URLSearchParams({
                        ...searchParams,
                        page: pageNum.toString(),
                      })}`}
                    >
                      {pageNum}
                    </Link>
                  </Button>
                );
              }
            )}
          </div>

          {page < result.pagination.pages && (
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link
                href={`/search?${new URLSearchParams({
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

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || '';
  const hasQuery = Boolean(query.trim());

  return (
    <div className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 lg:px-8 sm:py-8">
      {/* Search Header */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 font-display">
              {hasQuery ? `Search Results` : `Search Jewellery ✨`}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-500 font-sans">
              Find your dream handcrafted oxidised jhumkas, rings, and charm sets.
            </p>
          </div>
        </div>

        {/* Sleek Unified Luxury Search Bar */}
        <form action="/search" method="get" className="w-full max-w-2xl">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-stone-400 pointer-events-none" />
            <Input
              name="q"
              placeholder="Search jhumkas, rings, festive combos..."
              defaultValue={query}
              className="h-11 sm:h-12 w-full rounded-2xl border-stone-200 bg-white pl-10 pr-24 text-xs sm:text-sm font-medium shadow-xs focus-visible:ring-2 focus-visible:ring-amber-500/40"
              autoFocus={!hasQuery}
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {query && (
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <Link href="/search">
                    <X className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                className="h-8 sm:h-9 rounded-xl bg-stone-900 text-white hover:bg-black font-bold text-xs px-3.5 shadow-xs border-0"
              >
                Search
              </Button>
            </div>
          </div>
        </form>

        {/* Active Filters Bar */}
        {(query ||
          searchParams.category ||
          searchParams.minPrice ||
          searchParams.maxPrice) && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {query && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white border border-stone-200 text-stone-800 text-xs py-1 px-2.5 rounded-full shadow-xs">
                <span>Keyword: <strong>{query}</strong></span>
                <Link href="/search" className="ml-1 text-stone-400 hover:text-rose-600">
                  <X className="h-3 w-3" />
                </Link>
              </Badge>
            )}
            {searchParams.category && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white border border-stone-200 text-stone-800 text-xs py-1 px-2.5 rounded-full shadow-xs">
                <span>Category: <strong>{searchParams.category}</strong></span>
                <Link
                  href={`/search?${new URLSearchParams({
                    ...searchParams,
                    category: '',
                  })}`}
                  className="ml-1 text-stone-400 hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </Link>
              </Badge>
            )}
            {(searchParams.minPrice || searchParams.maxPrice) && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-white border border-stone-200 text-stone-800 text-xs py-1 px-2.5 rounded-full shadow-xs">
                <span>
                  Price: ₹{searchParams.minPrice || '0'} - ₹
                  {searchParams.maxPrice || '∞'}
                </span>
                <Link
                  href={`/search?${new URLSearchParams({
                    ...searchParams,
                    minPrice: '',
                    maxPrice: '',
                  })}`}
                  className="ml-1 text-stone-400 hover:text-rose-600"
                >
                  <X className="h-3 w-3" />
                </Link>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!hasQuery ? (
        <SearchLanding />
      ) : (
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop Only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar />
          </aside>

          {/* Main Results Grid */}
          <main className="flex-1 min-w-0">
            <Suspense fallback={<ProductGridSkeleton />}>
              <SearchResults searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      )}
    </div>
  );
}
