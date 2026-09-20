// Location: components/inventory-data-table.tsx
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  Sliders,
  FolderPlus,
  ShieldCheck,
  Star,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import {
  updateProductStock,
  adjustStock,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  toggleProductStatusAction,
} from '@/server/actions/inventory';
import { useToast } from '@/components/ui/use-toast';

export interface AdminInventoryItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  description?: string | null;
  image: string;
  images: Array<{ id: string; url: string; altText?: string | null; isPrimary?: boolean; position?: number }>;
  categoryId?: string | null;
  category: string;
  categorySlug: string;
  quantity: number; // available
  totalQuantity: number;
  reserved: number;
  reorderLevel: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  productStatus: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  material?: string | null;
  silverPurity?: string | null;
  badge?: string | null;
  vibe?: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface InventoryDataTableProps {
  items: AdminInventoryItem[];
  categories?: CategoryOption[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function InventoryDataTable({
  items: initialItems,
  categories = [],
  pagination,
}: InventoryDataTableProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [items, setItems] = useState<AdminInventoryItem[]>(initialItems);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<AdminInventoryItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Photo Uploader state
  const [activePhotos, setActivePhotos] = useState<Array<{ id: string; url: string }>>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    price: 999,
    comparePrice: 1999,
    categoryId: categories[0]?.id || '',
    initialStock: 25,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    material: 'Oxidised Silver Finish',
    silverPurity: 'Handcrafted Quality',
    badge: 'NEW_DROP',
    vibe: 'Garba & Festive Glam',
    description: '',
    imageUrl: '',
  });

  // Edit Product Form State
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    sku: '',
    price: 0,
    comparePrice: 0,
    categoryId: '',
    availableStock: 0,
    totalStock: 0,
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    material: '',
    silverPurity: '',
    badge: '',
    vibe: '',
    description: '',
  });

  // Quick inline delta adjustment (+1, -1, +10)
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

  // 1-Click Toggle Product Live Status (PUBLISHED <-> DRAFT)
  const handleToggleStatus = async (item: AdminInventoryItem) => {
    setUpdatingId(item.id);
    const targetStatus = item.productStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';

    // Optimistic update
    setItems(prev =>
      prev.map(it =>
        it.id === item.id ? { ...it, productStatus: targetStatus } : it
      )
    );

    try {
      const res = await toggleProductStatusAction(item.id);
      if (res.success) {
        toast({
          title: `Product ${res.newStatus === 'PUBLISHED' ? 'Published' : 'Moved to Draft'}`,
          description: `${item.name} is now ${res.newStatus}.`,
        });
      } else {
        // Rollback
        setItems(prev =>
          prev.map(it =>
            it.id === item.id ? { ...it, productStatus: item.productStatus } : it
          )
        );
        toast({
          title: 'Status Update Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to toggle status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: AdminInventoryItem) => {
    setSelectedProduct(item);
    setEditForm({
      id: item.id,
      name: item.name,
      sku: item.sku,
      price: item.price,
      comparePrice: item.comparePrice || 0,
      categoryId: item.categoryId || categories[0]?.id || '',
      availableStock: item.quantity,
      totalStock: item.totalQuantity,
      status: (item.productStatus === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'),
      material: item.material || 'Oxidised Silver Finish',
      silverPurity: item.silverPurity || 'Handcrafted Quality',
      badge: item.badge || 'NONE',
      vibe: item.vibe || 'NONE',
      description: item.description || '',
    });
    setIsEditModalOpen(true);
  };

  // Save Edit Product & Stock
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      toast({ title: 'Validation Error', description: 'Product name is required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);

    try {
      const res = await updateProductAction({
        id: editForm.id,
        name: editForm.name,
        sku: editForm.sku,
        price: editForm.price,
        comparePrice: editForm.comparePrice || null,
        categoryId: editForm.categoryId,
        availableStock: editForm.availableStock,
        totalStock: editForm.totalStock,
        status: editForm.status,
        material: editForm.material,
        silverPurity: editForm.silverPurity,
        badge: editForm.badge === 'NONE' ? null : editForm.badge,
        vibe: editForm.vibe === 'NONE' ? null : editForm.vibe,
        description: editForm.description,
      });

      if (res.success) {
        const catName = categories.find(c => c.id === editForm.categoryId)?.name || selectedProduct?.category || 'Uncategorized';
        let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
        if (editForm.availableStock === 0) newStatus = 'out-of-stock';
        else if (editForm.availableStock <= 10) newStatus = 'low-stock';

        setItems(prev =>
          prev.map(it =>
            it.id === editForm.id
              ? {
                  ...it,
                  name: editForm.name,
                  sku: editForm.sku,
                  price: editForm.price,
                  comparePrice: editForm.comparePrice,
                  categoryId: editForm.categoryId,
                  category: catName,
                  quantity: editForm.availableStock,
                  totalQuantity: editForm.totalStock,
                  status: newStatus,
                  productStatus: editForm.status,
                  material: editForm.material,
                  silverPurity: editForm.silverPurity,
                  badge: editForm.badge === 'NONE' ? null : editForm.badge,
                  vibe: editForm.vibe === 'NONE' ? null : editForm.vibe,
                  description: editForm.description,
                }
              : it
          )
        );
        setIsEditModalOpen(false);
        toast({
          title: 'Product & Inventory Updated',
          description: `Successfully saved ${editForm.name}.`,
        });
        router.refresh();
      } else {
        toast({
          title: 'Update Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update product',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Create New Product
  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) {
      toast({ title: 'Validation Error', description: 'Product name is required', variant: 'destructive' });
      return;
    }
    setIsSaving(true);

    try {
      const res = await createProductAction({
        name: newProduct.name,
        sku: newProduct.sku,
        price: newProduct.price,
        comparePrice: newProduct.comparePrice || null,
        categoryId: newProduct.categoryId || null,
        initialStock: newProduct.initialStock,
        status: newProduct.status,
        material: newProduct.material,
        silverPurity: newProduct.silverPurity,
        badge: newProduct.badge === 'NONE' ? null : newProduct.badge,
        vibe: newProduct.vibe === 'NONE' ? null : newProduct.vibe,
        description: newProduct.description,
        imageUrl: newProduct.imageUrl || undefined,
      });

      if (res.success && res.product) {
        toast({
          title: 'Jewellery Product Created! ✨',
          description: `${res.product.name} created and live in Supabase.`,
        });
        setIsAddModalOpen(false);
        // Reset form
        setNewProduct({
          name: '',
          sku: '',
          price: 999,
          comparePrice: 1999,
          categoryId: categories[0]?.id || '',
          initialStock: 25,
          status: 'PUBLISHED',
          material: 'Oxidised Silver Finish',
          silverPurity: 'Handcrafted Quality',
          badge: 'NEW_DROP',
          vibe: 'Garba & Festive Glam',
          description: '',
          imageUrl: '',
        });
        router.refresh();
      } else {
        toast({
          title: 'Creation Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to create product',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsSaving(true);

    try {
      const res = await deleteProductAction(selectedProduct.id);
      if (res.success) {
        setItems(prev => prev.filter(it => it.id !== selectedProduct.id));
        setIsDeleteModalOpen(false);
        toast({
          title: 'Product Deleted',
          description: `${selectedProduct.name} removed from Supabase.`,
        });
        router.refresh();
      } else {
        toast({
          title: 'Delete Failed',
          description: res.error,
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Photos Modal
  const openPhotosModal = (item: AdminInventoryItem) => {
    setSelectedProduct(item);
    setActivePhotos(item.images || (item.image ? [{ id: 'main', url: item.image }] : []));
    setUploadFile(null);
    setUploadPreview(null);
    setIsPhotosModalOpen(true);
  };

  // Handle Photo File Select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  // Upload Photo to Supabase Storage
  const handleUploadPhoto = async () => {
    if (!selectedProduct || !uploadFile) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', 'products');
      formData.append('productId', selectedProduct.id);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast({
          title: 'Photo Uploaded to Supabase! 📸',
          description: 'Image saved and linked to product in Supabase storage.',
        });
        const newImg = { id: Date.now().toString(), url: result.file.publicUrl };
        setActivePhotos(prev => [...prev, newImg]);
        setItems(prev =>
          prev.map(it =>
            it.id === selectedProduct.id
              ? {
                  ...it,
                  image: it.image || result.file.publicUrl,
                  images: [...it.images, newImg],
                }
              : it
          )
        );
        setUploadFile(null);
        setUploadPreview(null);
        router.refresh();
      } else {
        toast({
          title: 'Upload Failed',
          description: result.error || 'Failed to upload photo',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Network error during upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Delete Photo
  const handleDeletePhoto = async (photoUrl: string) => {
    if (!selectedProduct) return;

    try {
      const filename = photoUrl.split('/').pop();
      const path = `products/${filename}`;

      const res = await fetch(`/api/admin/media?path=${encodeURIComponent(path)}&deleteFromDb=true`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        toast({
          title: 'Photo Deleted',
          description: 'Image removed from Supabase storage.',
        });
        setActivePhotos(prev => prev.filter(img => img.url !== photoUrl));
        setItems(prev =>
          prev.map(it =>
            it.id === selectedProduct.id
              ? {
                  ...it,
                  images: it.images.filter(img => img.url !== photoUrl),
                }
              : it
          )
        );
        router.refresh();
      } else {
        toast({
          title: 'Delete Failed',
          description: result.error || 'Failed to delete photo',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete photo',
        variant: 'destructive',
      });
    }
  };

  const getStockBadge = (status: AdminInventoryItem['status']) => {
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
            ⚠️ Low Stock (≤10)
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

  return (
    <>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50/70 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Catalog Actions:</span>
          <Badge variant="outline" className="text-xs font-semibold bg-white">
            {pagination.total} Total Products
          </Badge>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4 text-amber-400" />
          Add New Jewellery Product
        </Button>
      </div>

      {/* Table */}
      {!items.length ? (
        <div className="p-16 text-center text-gray-500">
          <Package className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-bold text-lg text-gray-900">No Jewellery Products Found</p>
          <p className="text-xs text-gray-400 mt-1">Try changing your search query or add a new product.</p>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 rounded-xl bg-gray-900 text-white hover:bg-black font-bold text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Product Now
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/80 text-[11px] uppercase font-bold text-gray-600">
              <tr>
                <th className="px-5 py-4">Product &amp; Photo</th>
                <th className="px-5 py-4">SKU &amp; Category</th>
                <th className="px-5 py-4">Pricing</th>
                <th className="px-5 py-4">Live Status</th>
                <th className="px-5 py-4 text-center">Available Stock</th>
                <th className="px-5 py-4 text-center">Quick Adjust</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                  {/* Photo & Name */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        onClick={() => openPhotosModal(item)}
                        className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-stone-50 shadow-xs cursor-pointer hover:ring-2 hover:ring-stone-900 transition-all"
                        title="Click to manage Supabase photos"
                      >
                        <Image
                          src={item.image || '/images/placeholder.svg'}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        {item.images && item.images.length > 1 && (
                          <span className="absolute bottom-0 right-0 rounded-tl-md bg-stone-900/90 px-1 py-0.2 text-[8px] font-bold text-white">
                            +{item.images.length}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[200px]">
                        <Link
                          href={`/products/${item.slug}`}
                          target="_blank"
                          className="font-bold text-gray-900 hover:text-rose-600 truncate block text-xs"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.badge && (
                            <span className="rounded-sm bg-amber-100 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-900 uppercase">
                              {item.badge}
                            </span>
                          )}
                        </div>
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

                  {/* Pricing */}
                  <td className="px-5 py-4">
                    <div className="space-y-0.5">
                      <span className="font-extrabold text-gray-900 block text-xs">
                        {formatCurrency(item.price)}
                      </span>
                      {item.comparePrice && item.comparePrice > item.price && (
                        <span className="text-[10px] text-gray-400 line-through block">
                          {formatCurrency(item.comparePrice)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 1-Click Status Toggle */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase transition-all shadow-2xs ${
                        item.productStatus === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-700 border border-stone-300 hover:bg-stone-300'
                      }`}
                      title="Click to toggle Published / Draft status"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.productStatus === 'PUBLISHED' ? 'bg-emerald-600 animate-pulse' : 'bg-stone-500'
                        }`}
                      />
                      {item.productStatus}
                    </button>
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

                  {/* Action Buttons */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPhotosModal(item)}
                        className="h-8 px-2 text-xs font-bold rounded-lg border-gray-200 hover:bg-gray-100 gap-1"
                        title="Manage Photos"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-stone-600" />
                        Photos
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(item)}
                        className="h-8 px-2.5 text-xs font-bold rounded-lg border-gray-200 hover:bg-stone-900 hover:text-white gap-1"
                        title="Edit Details & Stock"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(item);
                          setIsDeleteModalOpen(true);
                        }}
                        className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        title="Delete Product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL 1: Add New Jewellery Product ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl p-6 bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Add New Jewellery Product
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Create product item with initial stock and live Supabase synchronization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Row 1: Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold text-gray-700">Product Name *</Label>
                <Input
                  value={newProduct.name}
                  onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Royal Kashmiri Mirror Dome Jhumka"
                  className="rounded-xl bg-white font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">SKU (Optional)</Label>
                <Input
                  value={newProduct.sku}
                  onChange={e => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g. JJ-KASH-01"
                  className="rounded-xl font-mono text-xs bg-white"
                />
              </div>
            </div>

            {/* Row 2: Category, Status, Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Category</Label>
                <Select
                  value={newProduct.categoryId}
                  onValueChange={val => setNewProduct(prev => ({ ...prev, categoryId: val }))}
                >
                  <SelectTrigger className="rounded-xl bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Live Status</Label>
                <Select
                  value={newProduct.status}
                  onValueChange={(val: 'PUBLISHED' | 'DRAFT') =>
                    setNewProduct(prev => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="rounded-xl bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published (Live)</SelectItem>
                    <SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Badge</Label>
                <Select
                  value={newProduct.badge}
                  onValueChange={val => setNewProduct(prev => ({ ...prev, badge: val }))}
                >
                  <SelectTrigger className="rounded-xl bg-white">
                    <SelectValue placeholder="Badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="NEW_DROP">NEW DROP</SelectItem>
                    <SelectItem value="TRENDING">TRENDING</SelectItem>
                    <SelectItem value="BESTSELLER">BESTSELLER</SelectItem>
                    <SelectItem value="VIRAL_ON_REELS">VIRAL ON REELS</SelectItem>
                    <SelectItem value="LIMITED_EDITION">LIMITED EDITION</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Price, Compare Price, Initial Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Regular Price (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={newProduct.price}
                  onChange={e => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl font-bold bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Compare Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={newProduct.comparePrice}
                  onChange={e => setNewProduct(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl font-bold bg-white text-gray-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Initial Stock (Units) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={newProduct.initialStock}
                  onChange={e => setNewProduct(prev => ({ ...prev, initialStock: parseInt(e.target.value) || 0 }))}
                  className="rounded-xl font-bold bg-white text-emerald-700"
                />
              </div>
            </div>

            {/* Row 4: Material, Purity, Vibe */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Material</Label>
                <Input
                  value={newProduct.material}
                  onChange={e => setNewProduct(prev => ({ ...prev, material: e.target.value }))}
                  placeholder="e.g. Oxidised Silver Finish"
                  className="rounded-xl bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Silver Purity</Label>
                <Input
                  value={newProduct.silverPurity}
                  onChange={e => setNewProduct(prev => ({ ...prev, silverPurity: e.target.value }))}
                  placeholder="e.g. Handcrafted Quality"
                  className="rounded-xl bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Occasion / Vibe</Label>
                <Input
                  value={newProduct.vibe}
                  onChange={e => setNewProduct(prev => ({ ...prev, vibe: e.target.value }))}
                  placeholder="e.g. Garba & Festive Glam"
                  className="rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Row 5: Image URL */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Cover Image URL (Optional)</Label>
              <Input
                value={newProduct.imageUrl}
                onChange={e => setNewProduct(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://... (or upload directly after creating)"
                className="rounded-xl bg-white font-mono text-xs"
              />
            </div>

            {/* Row 6: Description */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Product Description</Label>
              <textarea
                value={newProduct.description}
                onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Handcrafted authentic oxidised silver jhumka with antique finish..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-stone-900 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProduct}
              disabled={isSaving}
              className="rounded-xl bg-stone-900 text-white hover:bg-black font-bold text-xs"
            >
              {isSaving ? 'Creating in Supabase...' : 'Create Jewellery Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: Edit Product & Stock ── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl p-6 bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-rose-600" />
              Edit Product &amp; Stock Levels
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Live updates for pricing, metadata, and inventory count in Supabase.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold text-gray-700">Product Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl bg-white font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">SKU</Label>
                <Input
                  value={editForm.sku}
                  onChange={e => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                  className="rounded-xl font-mono text-xs bg-white"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Category</Label>
                <Select
                  value={editForm.categoryId}
                  onValueChange={val => setEditForm(prev => ({ ...prev, categoryId: val }))}
                >
                  <SelectTrigger className="rounded-xl bg-white">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Live Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: 'PUBLISHED' | 'DRAFT') =>
                    setEditForm(prev => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="rounded-xl bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published (Live)</SelectItem>
                    <SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Badge</Label>
                <Select
                  value={editForm.badge || 'NONE'}
                  onValueChange={val => setEditForm(prev => ({ ...prev, badge: val }))}
                >
                  <SelectTrigger className="rounded-xl bg-white">
                    <SelectValue placeholder="Badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="NEW_DROP">NEW DROP</SelectItem>
                    <SelectItem value="TRENDING">TRENDING</SelectItem>
                    <SelectItem value="BESTSELLER">BESTSELLER</SelectItem>
                    <SelectItem value="VIRAL_ON_REELS">VIRAL ON REELS</SelectItem>
                    <SelectItem value="LIMITED_EDITION">LIMITED EDITION</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price & Compare Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Price (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.price}
                  onChange={e => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl font-bold bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Compare Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.comparePrice}
                  onChange={e => setEditForm(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl font-bold bg-white text-gray-500"
                />
              </div>
            </div>

            {/* Inventory Controls */}
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-rose-600" />
                  Live Stock Units
                </span>
                <span className="text-[11px] text-gray-500">Synced directly with store cart &amp; checkout</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Available Stock (Units) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.availableStock}
                    onChange={e => setEditForm(prev => ({ ...prev, availableStock: parseInt(e.target.value) || 0 }))}
                    className="font-mono text-sm rounded-xl font-black bg-white text-emerald-700"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-gray-700">Total Stock (Units) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.totalStock}
                    onChange={e => setEditForm(prev => ({ ...prev, totalStock: parseInt(e.target.value) || 0 }))}
                    className="font-mono text-sm rounded-xl font-black bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {[10, 25, 50, 100].map(qty => (
                  <Button
                    key={qty}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditForm(prev => ({
                        ...prev,
                        availableStock: prev.availableStock + qty,
                        totalStock: prev.totalStock + qty,
                      }));
                    }}
                    className="h-7 flex-1 rounded-xl text-xs font-bold"
                  >
                    +{qty}
                  </Button>
                ))}
              </div>
            </div>

            {/* Material & Vibe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Material Finish</Label>
                <Input
                  value={editForm.material}
                  onChange={e => setEditForm(prev => ({ ...prev, material: e.target.value }))}
                  className="rounded-xl bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-gray-700">Occasion / Vibe</Label>
                <Input
                  value={editForm.vibe}
                  onChange={e => setEditForm(prev => ({ ...prev, vibe: e.target.value }))}
                  className="rounded-xl bg-white"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-700">Description</Label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-gray-200 p-3 text-xs focus:border-stone-900 focus:outline-none"
              />
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
              className="rounded-xl bg-stone-900 text-white hover:bg-black font-bold text-xs"
            >
              {isSaving ? 'Saving to Supabase...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: Manage Supabase Photos Drawer ── */}
      <Dialog open={isPhotosModalOpen} onOpenChange={setIsPhotosModalOpen}>
        <DialogContent className="max-w-xl p-6 bg-white rounded-3xl">
          {selectedProduct && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                  Product Photos: {selectedProduct.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Upload directly to Supabase Storage bucket (`jewellery`).
                </DialogDescription>
              </DialogHeader>

              {/* Photo Gallery Grid */}
              <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
                {activePhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    className="group relative h-28 w-full rounded-2xl overflow-hidden border border-gray-200 bg-stone-50 shadow-xs"
                  >
                    <Image
                      src={photo.url}
                      alt={selectedProduct.name}
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1.5 left-1.5 rounded-md bg-stone-900/80 px-1.5 py-0.5 text-[8px] font-black text-white">
                        Cover Photo
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.url)}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-lg bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-sm"
                      title="Delete from Supabase"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload New Photo Section */}
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-4 text-center bg-stone-50/50">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="space-y-3">
                    <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl border border-gray-300">
                      <Image src={uploadPreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setUploadFile(null);
                          setUploadPreview(null);
                        }}
                        className="rounded-xl text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUploadPhoto}
                        disabled={isUploadingPhoto}
                        className="rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold gap-1"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        {isUploadingPhoto ? 'Uploading to Supabase...' : 'Confirm Upload'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="text-xs font-bold text-gray-700">Upload additional photo</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl text-xs font-bold mt-1"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" /> Choose File
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPhotosModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: Delete Product Confirmation ── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl">
          {selectedProduct && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-rose-600 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Jewellery Product
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Are you sure you want to permanently delete <strong>{selectedProduct.name}</strong> (SKU: {selectedProduct.sku})? This will delete all attached stock and media from Supabase.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800">
                ⚠️ This action cannot be undone. Product will be removed from customer view immediately.
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDeleteProduct}
                  disabled={isSaving}
                  className="rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs"
                >
                  {isSaving ? 'Deleting from Supabase...' : 'Yes, Delete Product'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

