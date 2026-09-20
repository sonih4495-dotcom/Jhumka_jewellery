// Location: components/inventory-data-table.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Package,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Edit3,
  TrendingUp,
  Tag,
  Sparkles,
  Layers,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { updateProductStock, adjustStock } from '@/server/actions/inventory';
import { useToast } from '@/components/ui/use-toast';

export interface AdminInventoryItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  image: string;
  category: string;
  categorySlug: string;
  quantity: number; // available
  totalQuantity: number;
  reserved: number;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  productStatus: string;
}

interface InventoryDataTableProps {
  items: AdminInventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function InventoryDataTable({ items: initialItems, pagination }: InventoryDataTableProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminInventoryItem[]>(initialItems);
  const [selectedItem, setSelectedItem] = useState<AdminInventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAvailable, setEditAvailable] = useState<number>(0);
  const [editTotal, setEditTotal] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Quick inline delta adjustment (+1, -1, +5, -5)
  const handleQuickAdjust = async (productId: string, delta: number) => {
    setUpdatingId(productId);
    // Optimistic UI update
    setItems(prev =>
      prev.map(it => {
        if (it.id === productId) {
          const newQty = Math.max(0, it.quantity + delta);
          let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
          if (newQty === 0) newStatus = 'out-of-stock';
          else if (newQty <= 10) newStatus = 'low-stock';

          return {
            ...it,
            quantity: newQty,
            totalQuantity: Math.max(0, it.totalQuantity + delta),
            status: newStatus,
          };
        }
        return it;
      })
    );

    try {
      const res = await adjustStock(productId, delta);
      if (res.success) {
        toast({
          title: 'Stock Updated',
          description: `Inventory updated to ${res.newAvailable} units in Supabase.`,
        });
      } else {
        toast({
          title: 'Failed to adjust stock',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update stock',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openEditModal = (item: AdminInventoryItem) => {
    setSelectedItem(item);
    setEditAvailable(item.quantity);
    setEditTotal(item.totalQuantity);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    setIsSaving(true);

    try {
      const res = await updateProductStock(selectedItem.id, editAvailable, editTotal);
      if (res.success) {
        let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
        if (editAvailable === 0) newStatus = 'out-of-stock';
        else if (editAvailable <= 10) newStatus = 'low-stock';

        setItems(prev =>
          prev.map(it =>
            it.id === selectedItem.id
              ? {
                  ...it,
                  quantity: editAvailable,
                  totalQuantity: editTotal,
                  status: newStatus,
                }
              : it
          )
        );
        setIsEditModalOpen(false);
        toast({
          title: 'Inventory Saved',
          description: `Updated ${selectedItem.name} to ${editAvailable} available units.`,
        });
      } else {
        toast({
          title: 'Save Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update stock',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: AdminInventoryItem['status']) => {
    switch (status) {
      case 'in-stock':
        return (
          <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-bold hover:bg-emerald-100">
            ✓ In Stock
          </Badge>
        );
      case 'low-stock':
        return (
          <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold hover:bg-amber-100">
            ⚠️ Low Stock (&le;10)
          </Badge>
        );
      case 'out-of-stock':
        return (
          <Badge className="bg-rose-100 text-rose-900 border-rose-300 font-bold hover:bg-rose-100">
            ❌ Out of Stock
          </Badge>
        );
    }
  };

  if (!items.length) {
    return (
      <div className="p-16 text-center text-gray-500">
        <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
        <p className="font-bold text-lg text-gray-900">No Inventory Found</p>
        <p className="text-xs text-gray-400 mt-1">Try changing your search query or filter settings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] uppercase font-bold text-gray-600">
            <tr>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">SKU &amp; Category</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4 text-center">Available Stock</th>
              <th className="px-5 py-4 text-center">Quick Adjust</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                {/* Product Thumbnail & Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-stone-50 shadow-xs">
                      <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="min-w-0 max-w-[220px]">
                      <Link
                        href={`/products/${item.slug}`}
                        target="_blank"
                        className="font-bold text-gray-900 hover:text-rose-600 truncate block text-xs"
                      >
                        {item.name}
                      </Link>
                      <span className="text-[10px] text-gray-400 block truncate">
                        ID: {item.id.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </td>

                {/* SKU & Category */}
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-[11px] text-gray-700 block">
                      {item.sku}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-700">
                      {item.category}
                    </span>
                  </div>
                </td>

                {/* Price */}
                <td className="px-5 py-4 font-extrabold text-gray-900">
                  {formatCurrency(item.price)}
                </td>

                {/* Available Quantity */}
                <td className="px-5 py-4 text-center">
                  <span
                    className={`inline-flex items-center justify-center rounded-xl px-3 py-1 font-mono text-sm font-black shadow-xs ${
                      item.quantity === 0
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : item.quantity <= 10
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.quantity} units
                  </span>
                </td>

                {/* Quick Inline Increment/Decrement */}
                <td className="px-5 py-4 text-center">
                  <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200/80">
                    <button
                      type="button"
                      disabled={updatingId === item.id || item.quantity <= 0}
                      onClick={() => handleQuickAdjust(item.id, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-200 shadow-xs disabled:opacity-40 transition-all active:scale-95"
                      title="Decrease by 1"
                    >
                      <Minus className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleQuickAdjust(item.id, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-gray-700 hover:bg-gray-200 shadow-xs transition-all active:scale-95"
                      title="Increase by 1"
                    >
                      <Plus className="h-3 w-3" />
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleQuickAdjust(item.id, 10)}
                      className="px-2 h-7 rounded-lg bg-stone-900 text-white hover:bg-black text-[10px] font-bold shadow-xs transition-all active:scale-95"
                      title="Add 10 units"
                    >
                      +10
                    </button>
                  </div>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  {getStatusBadge(item.status)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    className="h-8 rounded-xl text-xs font-bold gap-1 hover:bg-stone-900 hover:text-white"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit Stock
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MODAL: Full Stock Adjustment Drawer ── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl">
          {selectedItem && (
            <div className="space-y-5">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-rose-600" />
                  Edit Stock: {selectedItem.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Update live inventory levels synced directly with Supabase.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200/80 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-white shrink-0">
                    <Image src={selectedItem.image} alt={selectedItem.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedItem.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono">SKU: {selectedItem.sku}</p>
                    <p className="text-[11px] font-bold text-rose-600">{formatCurrency(selectedItem.price)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Available Stock (Units) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editAvailable}
                      onChange={e => setEditAvailable(parseInt(e.target.value) || 0)}
                      className="font-mono text-sm rounded-xl font-bold bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-gray-700">Total Stock (Units) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={editTotal}
                      onChange={e => setEditTotal(parseInt(e.target.value) || 0)}
                      className="font-mono text-sm rounded-xl font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] text-gray-500 font-semibold block">Quick Add Presets:</span>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map(qty => (
                      <Button
                        key={qty}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditAvailable(prev => prev + qty);
                          setEditTotal(prev => prev + qty);
                        }}
                        className="h-8 flex-1 rounded-xl text-xs font-bold"
                      >
                        +{qty}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="rounded-xl bg-stone-900 text-white hover:bg-black text-xs font-bold"
                >
                  {isSaving ? 'Saving to Supabase...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
