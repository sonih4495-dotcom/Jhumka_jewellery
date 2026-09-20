'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Image as ImageIcon, Upload, X, Check, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  imageUrl?: string;
  images?: { id: string; url: string; altText?: string | null; isPrimary?: boolean }[];
}

interface ProductsDataTableProps {
  data: ProductItem[];
  isLoading?: boolean;
  onEdit?: (product: ProductItem) => void;
  onDelete?: (productId: string) => void;
  onRefresh?: () => void;
}

export function ProductsDataTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onRefresh,
}: ProductsDataTableProps) {
  const [activeProduct, setActiveProduct] = useState<ProductItem | null>(null);
  const [productImages, setProductImages] = useState<{ id: string; url: string; isPrimary?: boolean }[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openImageManager = (product: ProductItem) => {
    setActiveProduct(product);
    setProductImages(product.images || (product.imageUrl ? [{ id: '1', url: product.imageUrl, isPrimary: true }] : []));
    setUploadFile(null);
    setUploadPreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!activeProduct || !uploadFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', 'products');
      formData.append('productId', activeProduct.id);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Photo uploaded and linked to product!');
        setProductImages((prev) => [
          ...prev,
          { id: Date.now().toString(), url: result.file.publicUrl },
        ]);
        setUploadFile(null);
        setUploadPreview(null);
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (url: string) => {
    if (!activeProduct) return;

    try {
      const filename = url.split('/').pop();
      const path = `products/${filename}`;

      const res = await fetch(`/api/admin/media?path=${encodeURIComponent(path)}&deleteFromDb=true`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (result.success) {
        toast.success('Photo deleted');
        setProductImages((prev) => prev.filter((img) => img.url !== url));
        if (onRefresh) onRefresh();
      } else {
        toast.error(result.error || 'Delete failed');
      }
    } catch (err: any) {
      toast.error('Failed to delete photo');
    }
  };

  const columns: ColumnDef<ProductItem>[] = [
    {
      id: 'image',
      header: 'Photo',
      cell: ({ row }) => {
        const item = row.original;
        const imgUrl = item.imageUrl || item.images?.[0]?.url;
        const imgCount = item.images?.length || (item.imageUrl ? 1 : 0);

        return (
          <div
            onClick={() => openImageManager(item)}
            className="group relative h-12 w-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 cursor-pointer hover:ring-2 hover:ring-stone-900 transition-all"
            title="Click to manage photos"
          >
            {imgUrl ? (
              <Image
                src={imgUrl}
                alt={item.name}
                fill
                sizes="48px"
                className="object-cover group-hover:scale-105 transition-transform"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-400">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
            {imgCount > 1 && (
              <span className="absolute bottom-0 right-0 rounded-tl-md bg-stone-900/80 px-1 py-0.2 text-[8px] font-bold text-white">
                +{imgCount}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div>
          <p className="font-bold text-stone-900 text-sm">{row.original.name}</p>
          <p className="text-[11px] text-stone-500 font-mono">{row.original.sku}</p>
        </div>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => {
        const price = row.getValue('price') as number;
        return <span className="font-bold text-stone-900">₹{price.toLocaleString('en-IN')}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const value = row.getValue('status') as string;
        const statusStyles = {
          active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          inactive: 'bg-stone-100 text-stone-600 border-stone-200',
          discontinued: 'bg-rose-50 text-rose-700 border-rose-200',
        };
        return (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
              statusStyles[value as keyof typeof statusStyles] || 'bg-stone-100'
            }`}
          >
            {value.toUpperCase()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openImageManager(row.original)}
            className="h-8 px-2.5 text-xs font-bold rounded-lg border-stone-200 hover:bg-stone-100"
            title="Manage Photos in Supabase"
          >
            <ImageIcon className="h-3.5 w-3.5 mr-1 text-stone-600" />
            Photos
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(row.original)}
            className="h-8 w-8 p-0 rounded-lg border-stone-200"
            title="Edit details"
          >
            <Edit2 className="h-3.5 w-3.5 text-stone-600" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(row.original.id)}
            className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50"
            title="Delete product"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="py-8 text-center text-stone-500 text-sm">Loading products...</div>;
  }

  return (
    <>
      <DataTable columns={columns} data={data} />

      {/* ── Product Photo Management Modal ── */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Manage Product Photos</h2>
                <p className="text-xs text-stone-500 truncate max-w-md">{activeProduct.name}</p>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Photos Gallery */}
            <div className="mt-4">
              <label className="text-xs font-bold text-stone-700 block mb-2">
                Current Photos in Supabase Storage ({productImages.length})
              </label>

              {productImages.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                  <ImageIcon className="h-8 w-8 mx-auto text-stone-300 mb-1" />
                  <p className="text-xs text-stone-500">No photos attached to this product yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {productImages.map((img, idx) => (
                    <div
                      key={img.url + idx}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs"
                    >
                      <Image
                        src={img.url}
                        alt="Product Photo"
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized
                      />

                      {idx === 0 && (
                        <span className="absolute top-1 left-1 rounded bg-stone-900/90 text-amber-300 text-[8px] font-black px-1 py-0.5">
                          COVER
                        </span>
                      )}

                      {/* Overlay delete and preview */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 w-7 rounded-full bg-white text-stone-800 flex items-center justify-center hover:bg-stone-100"
                          title="View Full Size"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          onClick={() => handleDeletePhoto(img.url)}
                          className="h-7 w-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700"
                          title="Delete photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload New Photo Section */}
            <div className="mt-5 border-t pt-4">
              <label className="text-xs font-bold text-stone-800 block mb-2">
                Upload New Photo to this Product
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                {uploadPreview ? (
                  <div className="flex items-center gap-3 flex-1 bg-stone-50 border rounded-2xl p-2">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border bg-white">
                      <Image src={uploadPreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">{uploadFile?.name}</p>
                      <p className="text-[10px] text-stone-500">Ready to upload to Supabase</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleUploadPhoto}
                      disabled={isUploading}
                      className="rounded-full bg-stone-900 text-white hover:bg-stone-800 text-xs px-4"
                    >
                      {isUploading ? 'Uploading...' : 'Save Photo'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-2xl border-2 border-dashed border-stone-300 py-6 hover:border-stone-500 hover:bg-stone-50 text-xs font-bold text-stone-700"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Select Image from Computer to Add
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveProduct(null)}
                className="rounded-full text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
