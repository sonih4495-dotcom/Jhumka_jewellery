// Location: app/admin/inventory/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  AlertTriangle,
  Package,
  TrendingUp,
  Layers,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import { getInventoryData, getLiveInventoryStats } from '@/server/queries/inventory';
import { InventoryDataTable } from '@/components/inventory-data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface AdminInventoryPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    stockLevel?: string;
    page?: string;
  }>;
}

async function InventoryListSection({
  searchParams,
}: {
  searchParams: Awaited<AdminInventoryPageProps['searchParams']>;
}) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const category = searchParams.category || '';
  const stockLevel = searchParams.stockLevel || '';

  const result = await getInventoryData({
    page,
    limit: 25,
    search,
    category,
    stockLevel,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <p className="text-xs text-gray-500">
          Showing <strong className="text-gray-900">{(page - 1) * 25 + 1} - {Math.min(page * 25, result.pagination.total)}</strong> of{' '}
          <strong className="text-gray-900">{result.pagination.total}</strong> products
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <InventoryDataTable items={result.items} pagination={result.pagination} />
      </div>
    </div>
  );
}

export default async function AdminInventoryPage(props: AdminInventoryPageProps) {
  const searchParams = await props.searchParams;
  const currentStockLevel = searchParams.stockLevel || 'all';

  // Real-time dynamic stats directly from Supabase
  const stats = await getLiveInventoryStats();

  const STOCK_TABS = [
    { label: 'All Products', value: 'all', count: stats.totalItems },
    { label: 'Low Stock (≤10)', value: 'low-stock', count: stats.lowStock },
    { label: 'Out of Stock (0)', value: 'out-of-stock', count: stats.outOfStock },
    { label: 'In Stock (>10)', value: 'in-stock', count: Math.max(0, stats.totalItems - stats.lowStock - stats.outOfStock) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Inventory &amp; Stock Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time stock tracking, automatic order deductions, and quick inline stock adjustments.
          </p>
        </div>
      </div>

      {/* Live Inventory Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Items</span>
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{stats.totalItems}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{stats.totalUnits} total units in catalog</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Low Stock Warning</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-900">{stats.lowStock}</p>
          <p className="text-[10px] text-amber-700 mt-0.5">&le; 10 units remaining</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Out of Stock</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-900">{stats.outOfStock}</p>
          <p className="text-[10px] text-rose-700 mt-0.5">0 units available</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Inventory Valuation</span>
            <IndianRupee className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(stats.totalValue)}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">● Live inventory asset value</p>
        </div>
      </div>

      {/* Stock Filter Tabs & Search */}
      <div className="space-y-3">
        {/* Status Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {STOCK_TABS.map(tab => {
            const isSelected = currentStockLevel === tab.value;
            const searchObj = new URLSearchParams();
            if (tab.value !== 'all') searchObj.set('stockLevel', tab.value);
            if (searchParams.search) searchObj.set('search', searchParams.search);
            if (searchParams.category) searchObj.set('category', searchParams.category);

            return (
              <Link
                key={tab.value}
                href={`/admin/inventory${searchObj.toString() ? `?${searchObj.toString()}` : ''}`}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form method="GET" className="relative flex-1 w-full">
            {searchParams.stockLevel && (
              <input type="hidden" name="stockLevel" value={searchParams.stockLevel} />
            )}
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <Input
              name="search"
              placeholder="Search inventory by product name, SKU, or tag..."
              defaultValue={searchParams.search || ''}
              className="pl-9 text-xs rounded-xl bg-white border-gray-200 shadow-xs"
            />
          </form>
        </div>
      </div>

      {/* Inventory Table Container */}
      <Suspense
        fallback={
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-3 text-xs text-gray-500 font-semibold">Loading live inventory from Supabase...</p>
          </div>
        }
      >
        <InventoryListSection searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
