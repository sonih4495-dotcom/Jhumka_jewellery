// Location: components/inventory-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface InventoryFiltersProps {
  categories: CategoryOption[];
}

export function InventoryFilters({ categories }: InventoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || 'all';
  const currentStatus = searchParams.get('productStatus') || 'all';

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page'); // Reset to page 1
    router.push(`/admin/inventory?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search')?.toString() || '';
    updateFilters('search', query);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
        <Input
          name="search"
          placeholder="Search jewellery by name, SKU, or tag..."
          defaultValue={currentSearch}
          className="pl-9 text-xs rounded-xl bg-white border-gray-200 shadow-xs"
        />
      </form>

      {/* Quick Category Filter */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={currentCategory}
          onChange={(e) => updateFilters('category', e.target.value)}
          className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-xs focus:outline-none focus:border-stone-900 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={currentStatus}
          onChange={(e) => updateFilters('productStatus', e.target.value)}
          className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 shadow-xs focus:outline-none focus:border-stone-900 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="PUBLISHED">Published Only</option>
          <option value="DRAFT">Draft Only</option>
        </select>
      </div>
    </div>
  );
}
