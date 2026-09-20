// components/filter-sidebar.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, Sparkles, X, Check } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  { label: 'Chandbali Jhumkas', value: 'chandbali-jhumkas', emoji: '🌙' },
  { label: 'Temple Dome Jhumkas', value: 'dome-temple-jhumkas', emoji: '🔔' },
  { label: 'Kashmiri & Afghan', value: 'kashmiri-afghan-jhumkas', emoji: '✨' },
  { label: 'Peacock Filigree', value: 'peacock-floral-jhumkas', emoji: '🦚' },
  { label: 'Mini Daily Drops', value: 'mini-everyday-jhumkas', emoji: '🌸' },
  { label: 'Jhumka Sets & Combos', value: 'festive-jhumka-combos', emoji: '🎁' },
];

const DEFAULT_PRICE_RANGES = [
  { label: 'Under ₹499', min: undefined, max: 499 },
  { label: '₹500 - ₹999', min: 500, max: 999 },
  { label: '₹1,000 - ₹1,499', min: 1000, max: 1499 },
  { label: '₹1,500 & Above', min: 1500, max: undefined },
];

interface FilterSidebarProps {
  onCloseMobile?: () => void;
}

export function FilterSidebar({ onCloseMobile }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentMinPrice = searchParams.get('minPrice');
  const currentMaxPrice = searchParams.get('maxPrice');
  const activePriceRange = DEFAULT_PRICE_RANGES.find(r => {
    const minMatch = r.min === undefined ? !currentMinPrice : currentMinPrice === String(r.min);
    const maxMatch = r.max === undefined ? !currentMaxPrice : currentMaxPrice === String(r.max);
    return minMatch && maxMatch && (currentMinPrice || currentMaxPrice);
  });

  const handlePriceSelect = (range: typeof DEFAULT_PRICE_RANGES[0]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (activePriceRange?.label === range.label) {
      // Toggle off
      params.delete('minPrice');
      params.delete('maxPrice');
    } else {
      if (range.min !== undefined) params.set('minPrice', String(range.min));
      else params.delete('minPrice');

      if (range.max !== undefined) params.set('maxPrice', String(range.max));
      else params.delete('maxPrice');
    }

    router.push(`${pathname}?${params.toString()}`);
    onCloseMobile?.();
  };

  const handleClearAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
    onCloseMobile?.();
  };

  const hasActiveFilters = Boolean(currentMinPrice || currentMaxPrice);

  return (
    <div className="space-y-5">
      {/* Price Range Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Price Range
          </h3>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] font-bold text-rani hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {DEFAULT_PRICE_RANGES.map(range => {
            const isSelected = activePriceRange?.label === range.label;
            return (
              <button
                key={range.label}
                type="button"
                onClick={() => handlePriceSelect(range)}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all text-left ${
                  isSelected
                    ? 'bg-stone-900 text-white font-bold shadow-xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <span>{range.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-amber-300" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Card */}
      <div className="rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-xs">
        <h3 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-stone-900">
          Categories
        </h3>
        <div className="space-y-1">
          {DEFAULT_CATEGORIES.map(cat => {
            const isCurrentCategory = pathname.includes(cat.value);
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  router.push(`/category/${cat.value}`);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all text-left ${
                  isCurrentCategory
                    ? 'bg-rani/10 text-rani font-bold border border-rani/20'
                    : 'text-stone-700 hover:bg-stone-50 hover:text-stone-950 font-medium'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </span>
                {isCurrentCategory && <span className="text-[10px] text-rani font-bold">Active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mobile Filter Trigger Button & Slide-Out Sheet
export function MobileFilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const hasActiveFilters = Boolean(searchParams.get('minPrice') || searchParams.get('maxPrice'));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden relative rounded-xl border-stone-200 bg-white text-xs font-bold text-stone-800 shadow-xs h-9 px-3 gap-1.5 hover:bg-stone-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-stone-600" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-rani" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[340px] p-5 bg-[#FAF8F5] border-r border-stone-200 overflow-y-auto pb-safe">
        <SheetHeader className="text-left mb-4">
          <SheetTitle className="flex items-center gap-2 text-lg font-black text-stone-900 font-sans">
            <SlidersHorizontal className="h-4 w-4 text-amber-500" />
            Filter Jewellery
          </SheetTitle>
        </SheetHeader>
        <FilterSidebar onCloseMobile={() => setIsOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
