// components/sort-select.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SortSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function SortSelect({
  value,
  onValueChange,
}: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = value || searchParams.get('sort') || 'newest';

  const handleChange = (newVal: string) => {
    if (onValueChange) {
      onValueChange(newVal);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', newVal);
      params.delete('page');
      router.push(`?${params.toString()}`);
    }
  };

  return (
    <Select value={currentSort} onValueChange={handleChange}>
      <SelectTrigger className="w-[140px] sm:w-[170px] text-xs h-9 rounded-xl bg-white border-stone-200 shadow-xs font-semibold text-stone-800">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">✨ Newest First</SelectItem>
        <SelectItem value="price-low">💰 Price: Low to High</SelectItem>
        <SelectItem value="price-high">👑 Price: High to Low</SelectItem>
        <SelectItem value="popular">🔥 Most Popular</SelectItem>
        <SelectItem value="rating">⭐ Top Rated</SelectItem>
      </SelectContent>
    </Select>
  );
}
