'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Trash2,
  Copy,
  ExternalLink,
  RefreshCw,
  Folder,
  Check,
  Search,
  Plus,
  Tag,
  Sparkles,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

interface MediaItem {
  id: string;
  name: string;
  path: string;
  folder: string;
  size: number;
  updatedAt: string;
  publicUrl: string;
  linkedProducts: { id: string; name: string; slug: string }[];
  linkedCategories: { id: string; name: string; slug: string }[];
}

interface ProductOption {
  id: string;
  name: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, products: 0, categories: 0, banners: 0 });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>('products');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [linkProductId, setLinkProductId] = useState<string>('');
  const [linkCategoryId, setLinkCategoryId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Replace modal state
  const [replacingItem, setReplacingItem] = useState<MediaItem | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Delete confirm state
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied state
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setMedia(data.media || []);
        setCounts(data.counts || { total: 0, products: 0, categories: 0, banners: 0 });
        setProducts(data.availableProducts || []);
        setCategories(data.availableCategories || []);
      } else {
        toast.error(data.error || 'Failed to load media');
      }
    } catch (err: any) {
      toast.error('Network error loading media library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleCopyUrl = (url: string, path: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPath(path);
    toast.success('Public URL copied to clipboard');
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    if (!customFilename) {
      setCustomFilename(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', uploadFolder);
      if (customFilename) formData.append('filename', customFilename);
      if (linkProductId) formData.append('productId', linkProductId);
      if (linkCategoryId) formData.append('categoryId', linkCategoryId);

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Image uploaded to Supabase Storage!');
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadPreview(null);
        setCustomFilename('');
        setLinkProductId('');
        setLinkCategoryId('');
        fetchMedia();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingItem || !replaceFile) return;

    setIsReplacing(true);
    try {
      const formData = new FormData();
      formData.append('file', replaceFile);
      formData.append('folder', replacingItem.folder);
      formData.append('filename', replacingItem.name); // Overwrite same filename

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully replaced ${replacingItem.name}`);
        setReplacingItem(null);
        setReplaceFile(null);
        fetchMedia();
      } else {
        toast.error(data.error || 'Replace failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to replace image');
    } finally {
      setIsReplacing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/media?path=${encodeURIComponent(deletingItem.path)}&deleteFromDb=true`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted ${deletingItem.name} from Supabase`);
        setDeletingItem(null);
        fetchMedia();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredMedia = media.filter((item) => {
    const matchesFolder = selectedFolder === 'all' || item.folder === selectedFolder;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.linkedProducts.some((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.linkedCategories.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              Media &amp; Storage Manager
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Supabase Connected
            </Badge>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            CRUD images directly in your Supabase Storage Bucket (<code className="font-mono text-xs bg-stone-100 px-1 py-0.5 rounded">jewellery</code>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMedia}
            disabled={loading}
            className="rounded-full"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="rounded-full bg-stone-900 text-white hover:bg-stone-800 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Upload New Photo
          </Button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/80">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Photos', count: counts.total },
            { id: 'products', label: 'Products', count: counts.products },
            { id: 'categories', label: 'Categories', count: counts.categories },
            { id: 'banners', label: 'Banners & Hero', count: counts.banners },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFolder(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap ${
                selectedFolder === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            type="text"
            placeholder="Search by file or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs rounded-full bg-white border-stone-200"
          />
        </div>
      </div>

      {/* ── Media Grid ── */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-stone-400 mb-3" />
          <p className="text-sm font-semibold text-stone-600">Loading Supabase Storage library...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-white">
          <Folder className="h-10 w-10 text-stone-300 mx-auto mb-2" />
          <p className="text-base font-bold text-stone-800">No images found</p>
          <p className="text-xs text-stone-500 mt-1">
            {searchQuery ? 'Try changing your search keywords' : 'Click "Upload New Photo" to add your first image'}
          </p>
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="mt-4 rounded-full bg-stone-900 text-white"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Upload Image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item) => {
            const hasLinks = item.linkedProducts.length > 0 || item.linkedCategories.length > 0;
            const isCopied = copiedPath === item.path;

            return (
              <div
                key={item.path}
                className="group relative flex flex-col rounded-2xl border border-stone-200/90 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                {/* Image Preview */}
                <div className="relative aspect-square w-full bg-stone-100 overflow-hidden">
                  <Image
                    src={item.publicUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  
                  {/* Folder Tag overlay */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-black/75 text-white backdrop-blur-xs">
                      {item.folder}
                    </span>
                  </div>

                  {/* Action overlay buttons */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyUrl(item.publicUrl, item.path)}
                      title="Copy Public URL"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm hover:bg-white transition-colors"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open full size in new tab"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-stone-800 shadow-sm hover:bg-white transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Meta details */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-xs font-bold text-stone-900 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {(item.size / 1024).toFixed(1)} KB • Supabase Storage
                    </p>

                    {/* Linked items */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.linkedProducts.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 px-1.5 py-0.5 rounded"
                          title={p.name}
                        >
                          <Tag className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[130px]">{p.name}</span>
                        </span>
                      ))}

                      {item.linkedCategories.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded"
                          title={c.name}
                        >
                          <Layers className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[130px]">{c.name}</span>
                        </span>
                      ))}

                      {!hasLinks && (
                        <span className="text-[10px] text-stone-400 italic">
                          Unassigned asset
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReplacingItem(item);
                        setReplaceFile(null);
                      }}
                      className="h-7 px-2.5 text-[11px] font-bold rounded-lg hover:bg-stone-100"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Replace
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingItem(item)}
                      className="h-7 px-2 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Upload New Photo Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-white">
                  <Upload className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Upload to Supabase Storage</h2>
                  <p className="text-[11px] text-stone-500">Public bucket: <code className="font-mono">jewellery</code></p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-6 text-center cursor-pointer hover:border-stone-500 hover:bg-stone-50/50 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {uploadPreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative h-28 w-28 rounded-xl overflow-hidden shadow-md border">
                      <Image src={uploadPreview} alt="Preview" fill className="object-cover" />
                    </div>
                    <p className="text-xs font-bold text-stone-800">{uploadFile?.name}</p>
                    <p className="text-[10px] text-stone-500">Click to choose a different photo</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-stone-800">Drag &amp; drop or click to choose photo</p>
                    <p className="text-[10px] text-stone-400">JPG, PNG, WEBP up to 10MB</p>
                  </div>
                )}
              </div>

              {/* Target Folder */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Storage Folder</label>
                  <select
                    value={uploadFolder}
                    onChange={(e) => setUploadFolder(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="products">products/ (Product Gallery)</option>
                    <option value="categories">categories/ (Category Banners)</option>
                    <option value="banners">banners/ (Hero &amp; Promos)</option>
                    <option value="uploads">uploads/ (General Media)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Filename (Optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g. royal-chandbali-1"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Link to Database Item */}
              <div className="space-y-1.5 border-t pt-3">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>Link to Product in Store (Optional)</span>
                  <span className="text-[10px] text-stone-400 font-normal">Adds directly to gallery</span>
                </label>
                <select
                  value={linkProductId}
                  onChange={(e) => {
                    setLinkProductId(e.target.value);
                    if (e.target.value) setLinkCategoryId('');
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">-- Do not link to product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Link to Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span>Or Link as Category Image</span>
                  <span className="text-[10px] text-stone-400 font-normal">Updates category photo</span>
                </label>
                <select
                  value={linkCategoryId}
                  onChange={(e) => {
                    setLinkCategoryId(e.target.value);
                    if (e.target.value) setLinkProductId('');
                  }}
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">-- Do not link to category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!uploadFile || isUploading}
                  className="rounded-full bg-stone-900 text-white hover:bg-stone-800 text-xs px-5"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Uploading to Supabase...
                    </>
                  ) : (
                    'Upload &amp; Save'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Replace Photo Modal ── */}
      {replacingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3.5">
              <h2 className="text-base font-bold text-stone-900">Replace Image</h2>
              <button
                onClick={() => setReplacingItem(null)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReplaceSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-stone-600">
                You are replacing <strong className="font-mono text-stone-900">{replacingItem.name}</strong>. The existing file in Supabase Storage will be overwritten while keeping all product and category links intact.
              </p>

              <div
                onClick={() => replaceInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-5 text-center cursor-pointer hover:border-stone-500 hover:bg-stone-50/50"
              >
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setReplaceFile(e.target.files?.[0] || null)}
                  className="hidden"
                />

                {replaceFile ? (
                  <div className="flex flex-col items-center gap-1">
                    <Check className="h-8 w-8 text-emerald-600 mb-1" />
                    <p className="text-xs font-bold text-stone-900">{replaceFile.name}</p>
                    <p className="text-[10px] text-stone-500">{(replaceFile.size / 1024).toFixed(1)} KB selected</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="h-6 w-6 text-stone-400 mb-1" />
                    <p className="text-xs font-bold text-stone-800">Select replacement photo</p>
                    <p className="text-[10px] text-stone-400">Click to browse</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReplacingItem(null)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replaceFile || isReplacing}
                  className="rounded-full bg-stone-900 text-white hover:bg-stone-800 text-xs px-5"
                >
                  {isReplacing ? 'Replacing...' : 'Confirm Overwrite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600 mb-3">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-stone-900">Delete from Storage?</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="font-mono text-stone-900">{deletingItem.name}</strong> from Supabase Storage? Any products or categories using this image will have it unlinked.
            </p>

            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingItem(null)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 text-white hover:bg-rose-700 text-xs"
              >
                {isDeleting ? 'Deleting...' : 'Delete Image'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
