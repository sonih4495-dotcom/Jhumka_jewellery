// Location: components/inventory-data-table.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
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
  CornerDownLeft,
  CheckCircle2,
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

interface SelectedImageItem {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  name?: string;
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

  // Multi-image state for "Add Product"
  const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const productNameInputRef = useRef<HTMLInputElement>(null);

  // Photo Uploader state for "Manage Photos" modal
  const [activePhotos, setActivePhotos] = useState<Array<{ id: string; url: string }>>([]);
  const [singleUploadFile, setSingleUploadFile] = useState<File | null>(null);
  const [singleUploadPreview, setSingleUploadPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const singleFileInputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus on first input when opening Add modal
  useEffect(() => {
    if (isAddModalOpen) {
      setTimeout(() => {
        productNameInputRef.current?.focus();
      }, 150);
    }
  }, [isAddModalOpen]);

  // Global Keyboard Shortcuts (Ctrl+Enter / Cmd+Enter to submit modal)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isAddModalOpen && !isSaving) {
        handleCreateProduct();
      } else if (isEditModalOpen && !isSaving) {
        handleSaveEdit();
      }
    }
  };

  // Quick inline delta adjustment (+1, -1, +10)
  const handleQuickAdjust = async (productId: string, delta: number) => {
    setUpdatingId(productId);
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

  // Handle Multi-File Upload Selection for Add Product
  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: SelectedImageItem[] = [];

    Array.from(files).forEach((file, index) => {
      const isFirst = selectedImages.length === 0 && index === 0;
      newItems.push({
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        url: URL.createObjectURL(file),
        file,
        isPrimary: isFirst,
        name: file.name,
      });
    });

    setSelectedImages(prev => [...prev, ...newItems]);
  };

  // Handle manual image URL add
  const handleAddManualUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualImageUrl.trim()) return;

    const isFirst = selectedImages.length === 0;
    setSelectedImages(prev => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        url: manualImageUrl.trim(),
        isPrimary: isFirst,
      },
    ]);
    setManualImageUrl('');
  };

  // Set image as Cover/Primary
  const handleSetCoverImage = (id: string) => {
    setSelectedImages(prev =>
      prev.map(img => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  // Remove selected image
  const handleRemoveImage = (id: string) => {
    setSelectedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length > 0 && !filtered.some(img => img.isPrimary)) {
        const first = filtered[0];
        if (first) {
          first.isPrimary = true;
        }
      }
      return filtered;
    });
  };

  // Create New Product with Multiple Images
  const handleCreateProduct = async () => {
    if (!newProduct.name.trim()) {
      toast({ title: 'Validation Error', description: 'Product title is required', variant: 'destructive' });
      productNameInputRef.current?.focus();
      return;
    }
    setIsSaving(true);

    try {
      const finalImageUrls: string[] = [];

      // Sort images so primary cover image is first
      const sortedImages = [...selectedImages].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

      // 1. Upload any local files to Supabase Storage
      for (const img of sortedImages) {
        if (img.file) {
          try {
            const formData = new FormData();
            formData.append('file', img.file);
            formData.append('folder', 'products');

            const res = await fetch('/api/admin/media', {
              method: 'POST',
              body: formData,
            });
            const result = await res.json();
            if (result.success && result.file?.publicUrl) {
              finalImageUrls.push(result.file.publicUrl);
            }
          } catch (uploadErr) {
            console.warn('Failed to upload image file to Supabase:', uploadErr);
          }
        } else if (img.url && !img.url.startsWith('blob:')) {
          finalImageUrls.push(img.url);
        }
      }

      // 2. Create Product in database via server action
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
        imageUrls: finalImageUrls,
      });

      if (res.success && res.product) {
        toast({
          title: '✨ Jewellery Product Created!',
          description: `${res.product.name} created with ${finalImageUrls.length} photos and synced to Supabase.`,
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
        });
        setSelectedImages([]);
        setManualImageUrl('');
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
          title: 'Product & Stock Saved',
          description: `Updated ${editForm.name} in Supabase.`,
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

  // Open Photos Modal for existing product
  const openPhotosModal = (item: AdminInventoryItem) => {
    setSelectedProduct(item);
    setActivePhotos(item.images || (item.image ? [{ id: 'main', url: item.image }] : []));
    setSingleUploadFile(null);
    setSingleUploadPreview(null);
    setIsPhotosModalOpen(true);
  };

  // Upload Photo to Supabase Storage for existing product
  const handleUploadSinglePhoto = async () => {
    if (!selectedProduct || !singleUploadFile) return;

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', singleUploadFile);
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
        setSingleUploadFile(null);
        setSingleUploadPreview(null);
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

  // Delete Photo from existing product
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

  return (
    <>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50/80 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700">Catalog Actions:</span>
          <Badge variant="outline" className="text-xs font-semibold bg-white border-gray-300">
            {pagination.total} Total Jewellery Items
          </Badge>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-stone-900 hover:bg-black text-white font-black text-xs gap-2 shadow-sm transition-all active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
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
            className="mt-4 rounded-xl bg-stone-900 text-white hover:bg-black font-bold text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Product Now
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/90 text-[11px] uppercase font-black text-gray-700 tracking-wider">
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
                <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
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
                          <span className="absolute bottom-0 right-0 rounded-tl-md bg-stone-900/90 px-1.5 py-0.2 text-[8px] font-black text-white">
                            +{item.images.length}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 max-w-[210px]">
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
                        title="Manage Photos in Supabase"
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

      {/* ── MODAL 1: Add New Jewellery Product (Multi-Image & Keyboard Friendly) ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent
          onKeyDown={handleKeyDown}
          className="max-w-3xl p-0 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200"
        >
          {/* Header */}
          <div className="bg-stone-900 px-6 py-5 flex items-center justify-between text-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-stone-900 font-black">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Add New Jewellery Product
                </h2>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Upload multiple photos, set pricing, inventory, and sync live with Supabase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs bg-stone-50/40 flex-1">
            {/* Section 1: Core Details */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                  1. Product Details
                </span>
                <span className="text-[11px] text-stone-400">Basic catalog identity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-bold text-stone-800">
                    Product Title * <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    ref={productNameInputRef}
                    value={newProduct.name}
                    onChange={e => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Royal Kashmiri Mirror Dome Jhumka"
                    className="rounded-xl border-stone-300 bg-white font-medium focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 text-xs h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">SKU (Auto or Custom)</Label>
                  <Input
                    value={newProduct.sku}
                    onChange={e => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="e.g. JJ-KASH-01"
                    className="rounded-xl border-stone-300 font-mono text-xs bg-white h-9 focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">Category</Label>
                  <Select
                    value={newProduct.categoryId}
                    onValueChange={val => setNewProduct(prev => ({ ...prev, categoryId: val }))}
                  >
                    <SelectTrigger className="rounded-xl border-stone-300 bg-white h-9 text-xs">
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
                  <Label className="text-xs font-bold text-stone-800">Live Status</Label>
                  <Select
                    value={newProduct.status}
                    onValueChange={(val: 'PUBLISHED' | 'DRAFT') =>
                      setNewProduct(prev => ({ ...prev, status: val }))
                    }
                  >
                    <SelectTrigger className="rounded-xl border-stone-300 bg-white h-9 text-xs font-semibold">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">Published (Store Live)</SelectItem>
                      <SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">Storefront Badge</Label>
                  <Select
                    value={newProduct.badge}
                    onValueChange={val => setNewProduct(prev => ({ ...prev, badge: val }))}
                  >
                    <SelectTrigger className="rounded-xl border-stone-300 bg-white h-9 text-xs">
                      <SelectValue placeholder="Badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      <SelectItem value="NEW_DROP">NEW DROP ✨</SelectItem>
                      <SelectItem value="TRENDING">TRENDING 🔥</SelectItem>
                      <SelectItem value="BESTSELLER">BESTSELLER 👑</SelectItem>
                      <SelectItem value="VIRAL_ON_REELS">VIRAL ON REELS 📱</SelectItem>
                      <SelectItem value="LIMITED_EDITION">LIMITED EDITION 💎</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Stock */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                  2. Pricing &amp; Inventory
                </span>
                <span className="text-[11px] text-stone-400">Live stock units and pricing in ₹</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">
                    Regular Price (₹) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={newProduct.price}
                    onChange={e => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="rounded-xl border-stone-300 font-extrabold text-stone-900 bg-white h-9 text-sm focus:border-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">Compare Price / MRP (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={newProduct.comparePrice}
                    onChange={e => setNewProduct(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || 0 }))}
                    className="rounded-xl border-stone-300 font-bold bg-white text-stone-400 line-through h-9 text-sm focus:border-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">
                    Initial Stock (Units) <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={newProduct.initialStock}
                    onChange={e => setNewProduct(prev => ({ ...prev, initialStock: parseInt(e.target.value) || 0 }))}
                    className="rounded-xl border-stone-300 font-black bg-emerald-50 text-emerald-800 h-9 text-sm focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Jewellery Specs */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                  3. Jewellery Specs
                </span>
                <span className="text-[11px] text-stone-400">Purity and occasion vibes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">Material Finish</Label>
                  <Input
                    value={newProduct.material}
                    onChange={e => setNewProduct(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="e.g. Oxidised Silver Finish"
                    className="rounded-xl border-stone-300 bg-white h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">Silver Purity</Label>
                  <Input
                    value={newProduct.silverPurity}
                    onChange={e => setNewProduct(prev => ({ ...prev, silverPurity: e.target.value }))}
                    placeholder="e.g. Handcrafted Quality"
                    className="rounded-xl border-stone-300 bg-white h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-stone-800">Occasion / Vibe</Label>
                  <Input
                    value={newProduct.vibe}
                    onChange={e => setNewProduct(prev => ({ ...prev, vibe: e.target.value }))}
                    placeholder="e.g. Garba & Festive Glam"
                    className="rounded-xl border-stone-300 bg-white h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Multi-Image Uploader Dropzone */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                    4. Product Media &amp; Photos
                  </span>
                  <span className="text-[11px] text-stone-500 font-semibold">
                    ({selectedImages.length} photos selected)
                  </span>
                </div>
                <span className="text-[10px] text-stone-400">Direct upload to Supabase</span>
              </div>

              {/* Dropzone Container */}
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleAddFiles(e.dataTransfer.files);
                }}
                onClick={() => addFileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
                    : 'border-stone-300 bg-stone-50 hover:bg-stone-100/70 hover:border-stone-400'
                }`}
              >
                <input
                  type="file"
                  ref={addFileInputRef}
                  onChange={e => handleAddFiles(e.target.files)}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                <div className="space-y-2">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-xs border border-stone-200 text-stone-700">
                    <Upload className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Drag &amp; drop multiple product photos, or{' '}
                      <span className="text-amber-600 underline">browse files</span>
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      Select multiple angles (Front, Dome, Hook, Model Preview). PNG, JPG, WEBP up to 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual URL Input Option */}
              <div className="flex items-center gap-2 pt-1">
                <Input
                  value={manualImageUrl}
                  onChange={e => setManualImageUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualUrl();
                    }
                  }}
                  placeholder="Or paste image URL (https://...) and press Add"
                  className="rounded-xl border-stone-300 text-xs bg-white h-8"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddManualUrl()}
                  className="rounded-xl text-xs font-bold h-8 shrink-0 bg-white hover:bg-stone-900 hover:text-white"
                >
                  Add URL
                </Button>
              </div>

              {/* Selected Images Grid with Cover Star */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  {selectedImages.map((img, idx) => (
                    <div
                      key={img.id}
                      className={`group relative h-24 rounded-2xl overflow-hidden border-2 bg-stone-100 transition-all ${
                        img.isPrimary ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-stone-200'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt="Product preview"
                        fill
                        sizes="100px"
                        className="object-cover"
                      />

                      {/* Cover Badge */}
                      {img.isPrimary && (
                        <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-md bg-stone-900/90 px-1.5 py-0.5 text-[8px] font-black text-amber-400 shadow-xs">
                          <Star className="h-2.5 w-2.5 fill-amber-400" />
                          Cover
                        </span>
                      )}

                      {/* Action buttons on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSetCoverImage(img.id);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-900 text-amber-400 hover:bg-black shadow-sm"
                            title="Set as Cover photo"
                          >
                            <Star className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveImage(img.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 5: Description */}
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-black text-amber-400 uppercase">
                  5. Product Description
                </span>
                <span className="text-[11px] text-stone-400">Detailed craft and jewellery features</span>
              </div>

              <textarea
                value={newProduct.description}
                onChange={e => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Handcrafted authentic oxidised silver jhumka featuring artisan filigree dome..."
                rows={3}
                className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Sticky Non-Clipped Footer */}
          <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 shadow-lg">
            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
              <span className="inline-flex items-center rounded-md bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold text-stone-700">
                Ctrl + Enter
              </span>
              <span>to Save &amp; Sync with Supabase</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl border-stone-300 text-xs font-semibold hover:bg-stone-100 h-9 flex-1 sm:flex-initial"
              >
                Cancel (Esc)
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleCreateProduct}
                disabled={isSaving}
                className="rounded-xl bg-stone-900 text-white hover:bg-black font-black text-xs gap-1.5 shadow-md h-9 flex-1 sm:flex-initial"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                {isSaving ? 'Uploading Photos & Saving...' : 'Create Jewellery Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: Edit Product & Stock ── */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          onKeyDown={handleKeyDown}
          className="max-w-2xl p-0 bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200"
        >
          {/* Header */}
          <div className="bg-stone-900 px-6 py-5 flex items-center justify-between text-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white font-black">
                  <Edit3 className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Edit Product &amp; Stock Levels
                </h2>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Live updates for pricing, metadata, and inventory count in Supabase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 text-xs bg-stone-50/40 flex-1">
            {/* Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-bold text-stone-800">Product Name *</Label>
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-xl border-stone-300 bg-white font-medium focus:border-stone-900 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">SKU</Label>
                <Input
                  value={editForm.sku}
                  onChange={e => setEditForm(prev => ({ ...prev, sku: e.target.value }))}
                  className="rounded-xl border-stone-300 font-mono text-xs bg-white h-9 focus:border-stone-900"
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">Category</Label>
                <Select
                  value={editForm.categoryId}
                  onValueChange={val => setEditForm(prev => ({ ...prev, categoryId: val }))}
                >
                  <SelectTrigger className="rounded-xl border-stone-300 bg-white h-9">
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
                <Label className="text-xs font-bold text-stone-800">Live Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: 'PUBLISHED' | 'DRAFT') =>
                    setEditForm(prev => ({ ...prev, status: val }))
                  }
                >
                  <SelectTrigger className="rounded-xl border-stone-300 bg-white h-9 font-semibold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published (Store Live)</SelectItem>
                    <SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">Badge</Label>
                <Select
                  value={editForm.badge || 'NONE'}
                  onValueChange={val => setEditForm(prev => ({ ...prev, badge: val }))}
                >
                  <SelectTrigger className="rounded-xl border-stone-300 bg-white h-9">
                    <SelectValue placeholder="Badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="NEW_DROP">NEW DROP ✨</SelectItem>
                    <SelectItem value="TRENDING">TRENDING 🔥</SelectItem>
                    <SelectItem value="BESTSELLER">BESTSELLER 👑</SelectItem>
                    <SelectItem value="VIRAL_ON_REELS">VIRAL ON REELS 📱</SelectItem>
                    <SelectItem value="LIMITED_EDITION">LIMITED EDITION 💎</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price & Compare Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">Price (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.price}
                  onChange={e => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl border-stone-300 font-extrabold text-stone-900 bg-white h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">Compare Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={editForm.comparePrice}
                  onChange={e => setEditForm(prev => ({ ...prev, comparePrice: parseFloat(e.target.value) || 0 }))}
                  className="rounded-xl border-stone-300 font-bold bg-white text-stone-400 line-through h-9 text-sm"
                />
              </div>
            </div>

            {/* Inventory Controls */}
            <div className="rounded-2xl bg-white p-4 border border-stone-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-rose-600" />
                  Live Stock Units
                </span>
                <span className="text-[11px] text-stone-500">Synced directly with store cart &amp; checkout</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-700">Available Stock (Units) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.availableStock}
                    onChange={e => setEditForm(prev => ({ ...prev, availableStock: parseInt(e.target.value) || 0 }))}
                    className="font-mono text-sm rounded-xl font-black bg-emerald-50 text-emerald-800 h-9 border-stone-300"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-stone-700">Total Stock (Units) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.totalStock}
                    onChange={e => setEditForm(prev => ({ ...prev, totalStock: parseInt(e.target.value) || 0 }))}
                    className="font-mono text-sm rounded-xl font-black bg-white h-9 border-stone-300"
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
                    className="h-7 flex-1 rounded-xl text-xs font-bold border-stone-200 hover:bg-stone-100"
                  >
                    +{qty}
                  </Button>
                ))}
              </div>
            </div>

            {/* Material & Vibe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">Material Finish</Label>
                <Input
                  value={editForm.material}
                  onChange={e => setEditForm(prev => ({ ...prev, material: e.target.value }))}
                  className="rounded-xl border-stone-300 bg-white h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-stone-800">Occasion / Vibe</Label>
                <Input
                  value={editForm.vibe}
                  onChange={e => setEditForm(prev => ({ ...prev, vibe: e.target.value }))}
                  className="rounded-xl border-stone-300 bg-white h-9"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-stone-800">Description</Label>
              <textarea
                value={editForm.description}
                onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full rounded-xl border border-stone-300 p-3 text-xs focus:border-stone-900 focus:outline-none bg-white"
              />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-white border-t border-stone-200 px-6 py-4 flex items-center justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border-stone-300 text-xs h-9 font-semibold"
            >
              Cancel (Esc)
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="rounded-xl bg-stone-900 text-white hover:bg-black font-black text-xs h-9 px-4"
            >
              {isSaving ? 'Saving to Supabase...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: Manage Supabase Photos Drawer ── */}
      <Dialog open={isPhotosModalOpen} onOpenChange={setIsPhotosModalOpen}>
        <DialogContent className="max-w-xl p-0 bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
          <div className="bg-stone-900 px-6 py-5 flex items-center justify-between text-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500 text-white font-black">
                  <ImageIcon className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-black tracking-tight text-white">
                  Product Photos: {selectedProduct?.name}
                </h2>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                Upload multiple images directly to Supabase Storage bucket (`jewellery`).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPhotosModalOpen(false)}
              className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 text-xs bg-stone-50/40">
            {/* Photo Gallery Grid */}
            <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto p-1">
              {activePhotos.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  className="group relative h-28 w-full rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs"
                >
                  <Image
                    src={photo.url}
                    alt={selectedProduct?.name || 'Photo'}
                    fill
                    sizes="150px"
                    className="object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-md bg-stone-900/90 px-1.5 py-0.5 text-[8px] font-black text-white">
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
            <div className="rounded-2xl border-2 border-dashed border-stone-300 p-4 text-center bg-white">
              <input
                type="file"
                ref={singleFileInputRef}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setSingleUploadFile(file);
                  setSingleUploadPreview(URL.createObjectURL(file));
                }}
                accept="image/*"
                className="hidden"
              />

              {singleUploadPreview ? (
                <div className="space-y-3">
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-xl border border-stone-300">
                    <Image src={singleUploadPreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSingleUploadFile(null);
                        setSingleUploadPreview(null);
                      }}
                      className="rounded-xl text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUploadSinglePhoto}
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
                  <ImageIcon className="mx-auto h-8 w-8 text-stone-400" />
                  <p className="text-xs font-bold text-stone-800">Upload additional photo</p>
                  <p className="text-[10px] text-stone-400">PNG, JPG, WEBP up to 5MB</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => singleFileInputRef.current?.click()}
                    className="rounded-xl text-xs font-bold mt-1 border-stone-300 hover:bg-stone-100"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1" /> Choose File
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border-t border-stone-200 px-6 py-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsPhotosModalOpen(false)}
              className="rounded-xl text-xs font-semibold h-9"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 4: Delete Product Confirmation ── */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-stone-200 shadow-2xl">
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

              <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 text-xs text-rose-800 font-medium">
                ⚠️ This action cannot be undone. Product will be removed from customer view immediately.
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-xl text-xs font-semibold"
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
