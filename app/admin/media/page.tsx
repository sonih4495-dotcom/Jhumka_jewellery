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
  Video,
  Play,
  Instagram,
  Heart,
  ShoppingBag,
  Volume2,
  VolumeX,
  Eye,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { ReelItem } from '@/lib/reels-data';

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
  price?: number;
  slug?: string;
  image?: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, products: 0, categories: 0, banners: 0, videos: 0 });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  
  // Upload photo modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFolder, setUploadFolder] = useState<string>('products');
  const [customFilename, setCustomFilename] = useState<string>('');
  const [linkProductId, setLinkProductId] = useState<string>('');
  const [linkCategoryId, setLinkCategoryId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Add Reel & Video modal state
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  const [reelCreator, setReelCreator] = useState('');
  const [reelHandle, setReelHandle] = useState('');
  const [reelTitle, setReelTitle] = useState('');
  const [reelLikes, setReelLikes] = useState('15.2K');
  const [reelInstagramUrl, setReelInstagramUrl] = useState('');
  const [reelProductId, setReelProductId] = useState('');
  const [reelVideoFile, setReelVideoFile] = useState<File | null>(null);
  const [reelThumbnailFile, setReelThumbnailFile] = useState<File | null>(null);
  const [reelVideoPreview, setReelVideoPreview] = useState<string | null>(null);
  const [reelThumbnailPreview, setReelThumbnailPreview] = useState<string | null>(null);
  const [isSavingReel, setIsSavingReel] = useState(false);

  // Edit Reel modal state
  const [isEditReelModalOpen, setIsEditReelModalOpen] = useState(false);
  const [editingReelId, setEditingReelId] = useState('');
  const [editReelCreator, setEditReelCreator] = useState('');
  const [editReelHandle, setEditReelHandle] = useState('');
  const [editReelTitle, setEditReelTitle] = useState('');
  const [editReelLikes, setEditReelLikes] = useState('');
  const [editReelInstagramUrl, setEditReelInstagramUrl] = useState('');
  const [editReelProductId, setEditReelProductId] = useState('');
  const [editReelVideoUrl, setEditReelVideoUrl] = useState('');
  const [editReelThumbnailUrl, setEditReelThumbnailUrl] = useState('');
  const [editReelVideoFile, setEditReelVideoFile] = useState<File | null>(null);
  const [editReelThumbnailFile, setEditReelThumbnailFile] = useState<File | null>(null);
  const [editReelVideoPreview, setEditReelVideoPreview] = useState<string | null>(null);
  const [editReelThumbnailPreview, setEditReelThumbnailPreview] = useState<string | null>(null);
  const [isSavingEditReel, setIsSavingEditReel] = useState(false);

  // Replace modal state
  const [replacingItem, setReplacingItem] = useState<MediaItem | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  // Delete confirm state
  const [deletingItem, setDeletingItem] = useState<MediaItem | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copied state
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  // Preview Reel modal state
  const [previewReel, setPreviewReel] = useState<ReelItem | null>(null);
  const [isModalMuted, setIsModalMuted] = useState(false);
  const [isModalPlaying, setIsModalPlaying] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const reelVideoInputRef = useRef<HTMLInputElement>(null);
  const reelThumbInputRef = useRef<HTMLInputElement>(null);
  const editReelVideoInputRef = useRef<HTMLInputElement>(null);
  const editReelThumbInputRef = useRef<HTMLInputElement>(null);
  const adminVideoRef = useRef<HTMLVideoElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const [mediaRes, reelsRes] = await Promise.all([
        fetch('/api/admin/media'),
        fetch('/api/admin/reels'),
      ]);

      const mediaData = await mediaRes.json();
      if (mediaData.success) {
        setMedia(mediaData.media || []);
        setCounts(mediaData.counts || { total: 0, products: 0, categories: 0, banners: 0, videos: 0 });
        setProducts(mediaData.availableProducts || []);
        setCategories(mediaData.availableCategories || []);
      }

      const reelsData = await reelsRes.json();
      if (reelsData.success) {
        setReels(reelsData.reels || []);
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

  const handleReelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelCreator || !reelTitle) {
      toast.error('Creator name and title are required');
      return;
    }

    if (!reelVideoFile && !reelInstagramUrl) {
      toast.error('Please either upload a video file (.mp4) or provide an Instagram Reel link');
      return;
    }

    setIsSavingReel(true);
    try {
      let uploadedVideoUrl = '';
      let uploadedThumbUrl = '';

      // 1. Upload Video File to Supabase Storage if present
      if (reelVideoFile) {
        toast.loading('Uploading video to Supabase Storage...', { id: 'reel-upload' });
        const videoData = new FormData();
        videoData.append('file', reelVideoFile);
        videoData.append('folder', 'videos');
        const videoRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: videoData,
        });
        const videoJson = await videoRes.json();
        if (!videoJson.success) {
          throw new Error(videoJson.error || 'Failed to upload video to Supabase');
        }
        uploadedVideoUrl = videoJson.file.publicUrl;
      }

      // 2. Upload Thumbnail File if present
      if (reelThumbnailFile) {
        const thumbData = new FormData();
        thumbData.append('file', reelThumbnailFile);
        thumbData.append('folder', 'uploads');
        const thumbRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: thumbData,
        });
        const thumbJson = await thumbRes.json();
        if (thumbJson.success) {
          uploadedThumbUrl = thumbJson.file.publicUrl;
        }
      }

      toast.loading('Saving Reel details...', { id: 'reel-upload' });

      // 3. Save Reel in backend
      const res = await fetch('/api/admin/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator: reelCreator,
          handle: reelHandle,
          title: reelTitle,
          likes: reelLikes,
          videoUrl: uploadedVideoUrl,
          instagramUrl: reelInstagramUrl,
          thumbnail: uploadedThumbUrl,
          productId: reelProductId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Reel added and live on #JhumkaJunction IRL ✨!', { id: 'reel-upload' });
        setIsReelModalOpen(false);
        setReelCreator('');
        setReelHandle('');
        setReelTitle('');
        setReelInstagramUrl('');
        setReelProductId('');
        setReelVideoFile(null);
        setReelThumbnailFile(null);
        setReelVideoPreview(null);
        setReelThumbnailPreview(null);
        fetchMedia();
      } else {
        toast.error(data.error || 'Failed to save reel', { id: 'reel-upload' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating reel', { id: 'reel-upload' });
    } finally {
      setIsSavingReel(false);
    }
  };

  const openEditReelModal = (reel: ReelItem) => {
    setEditingReelId(reel.id);
    setEditReelCreator(reel.creator);
    setEditReelHandle(reel.handle);
    setEditReelTitle(reel.title);
    setEditReelLikes(reel.likes);
    setEditReelInstagramUrl(reel.instagramUrl || '');
    setEditReelProductId(reel.taggedProduct?.id || '');
    setEditReelVideoUrl(reel.videoUrl || '');
    setEditReelThumbnailUrl(reel.thumbnail || '');
    setEditReelVideoFile(null);
    setEditReelThumbnailFile(null);
    setEditReelVideoPreview(null);
    setEditReelThumbnailPreview(null);
    setIsEditReelModalOpen(true);
  };

  const handleEditReelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReelCreator || !editReelTitle) {
      toast.error('Creator name and title are required');
      return;
    }

    setIsSavingEditReel(true);
    try {
      let finalVideoUrl = editReelVideoUrl;
      let finalThumbUrl = editReelThumbnailUrl;

      // 1. Upload new video file to Supabase Storage if chosen
      if (editReelVideoFile) {
        toast.loading('Uploading replacement video to Supabase Storage...', { id: 'reel-edit' });
        const videoData = new FormData();
        videoData.append('file', editReelVideoFile);
        videoData.append('folder', 'videos');
        const videoRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: videoData,
        });
        const videoJson = await videoRes.json();
        if (!videoJson.success) {
          throw new Error(videoJson.error || 'Failed to upload video to Supabase');
        }
        finalVideoUrl = videoJson.file.publicUrl;
      }

      // 2. Upload new thumbnail if chosen
      if (editReelThumbnailFile) {
        const thumbData = new FormData();
        thumbData.append('file', editReelThumbnailFile);
        thumbData.append('folder', 'uploads');
        const thumbRes = await fetch('/api/admin/media', {
          method: 'POST',
          body: thumbData,
        });
        const thumbJson = await thumbRes.json();
        if (thumbJson.success) {
          finalThumbUrl = thumbJson.file.publicUrl;
        }
      }

      toast.loading('Saving Reel updates...', { id: 'reel-edit' });

      // 3. Send PUT request
      const res = await fetch('/api/admin/reels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingReelId,
          creator: editReelCreator,
          handle: editReelHandle,
          title: editReelTitle,
          likes: editReelLikes,
          videoUrl: finalVideoUrl,
          instagramUrl: editReelInstagramUrl,
          thumbnail: finalThumbUrl,
          productId: editReelProductId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Reel updated successfully! ✨', { id: 'reel-edit' });
        setIsEditReelModalOpen(false);
        fetchMedia();
      } else {
        toast.error(data.error || 'Failed to update reel', { id: 'reel-edit' });
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating reel', { id: 'reel-edit' });
    } finally {
      setIsSavingEditReel(false);
    }
  };

  const handleDeleteReelConfirm = async () => {
    if (!deletingReelId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/reels?id=${deletingReelId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Reel deleted');
        setDeletingReelId(null);
        fetchMedia();
      } else {
        toast.error(data.error || 'Failed to delete reel');
      }
    } catch (err: any) {
      toast.error('Network error deleting reel');
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

  const filteredReels = reels.filter((r) => {
    if (!searchQuery) return true;
    return (
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.taggedProduct?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
              Supabase Storage
            </Badge>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Manage photos, product assets, and Instagram / Gen Z video reels stored in Supabase (<code className="font-mono text-xs bg-stone-100 px-1 py-0.5 rounded">jewellery</code>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            className="rounded-full bg-stone-900 text-white hover:bg-black shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Upload Photo
          </Button>

          <Button
            size="sm"
            onClick={() => setIsReelModalOpen(true)}
            className="rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-amber-700 text-white font-bold shadow-md"
          >
            <Video className="h-4 w-4 mr-1.5" />
            + Add Reel &amp; Video
          </Button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-stone-900/95 text-stone-200 p-3 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Photos', count: counts.total, isReels: false },
            { id: 'reels', label: '✨ Reels & Videos', count: reels.length, isReels: true },
            { id: 'products', label: 'Products', count: counts.products, isReels: false },
            { id: 'categories', label: 'Categories', count: counts.categories, isReels: false },
            { id: 'banners', label: 'Banners & Hero', count: counts.banners, isReels: false },
          ].map((tab) => {
            const isActive = selectedFolder === tab.id;
            let tabClass = '';
            let badgeClass = '';

            if (tab.isReels) {
              if (isActive) {
                tabClass = 'bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white font-black shadow-lg border border-pink-400/50 scale-[1.02]';
                badgeClass = 'bg-black/30 text-white font-black';
              } else {
                tabClass = 'bg-pink-950/40 text-pink-300 font-bold border border-pink-500/30 hover:bg-pink-900/50 hover:text-white';
                badgeClass = 'bg-pink-900/60 text-pink-200';
              }
            } else {
              if (isActive) {
                tabClass = 'bg-amber-400 text-stone-950 font-black shadow-md border border-amber-300 scale-[1.02]';
                badgeClass = 'bg-stone-900 text-amber-300 font-bold';
              } else {
                tabClass = 'bg-stone-800/80 text-stone-300 font-semibold border border-stone-700/80 hover:bg-stone-800 hover:text-white';
                badgeClass = 'bg-stone-950/80 text-stone-400';
              }
            }

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFolder(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-full transition-all duration-200 whitespace-nowrap ${tabClass}`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 text-[10px] rounded-full leading-none ${badgeClass}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
          <Input
            type="text"
            placeholder="Search media, reels, products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 pr-3 text-xs rounded-full bg-stone-950 border-stone-700 text-white placeholder:text-stone-500 focus:border-amber-400 focus:ring-amber-400"
          />
        </div>
      </div>

      {/* ── VIEW 1: REELS & IRL VIDEOS TAB ── */}
      {selectedFolder === 'reels' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Video className="h-5 w-5 text-rani" />
                #JhumkaJunction IRL Video Reels Studio
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                These styling clips appear live in the homepage Instagram/TikTok reels carousel.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsReelModalOpen(true)}
              className="rounded-full bg-stone-900 text-white hover:bg-black text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add New Reel
            </Button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-stone-400 mb-3" />
              <p className="text-sm font-semibold text-stone-600">Loading reels...</p>
            </div>
          ) : filteredReels.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-white p-8">
              <Video className="h-10 w-10 text-stone-300 mx-auto mb-2" />
              <p className="text-base font-bold text-stone-800">No reels found</p>
              <p className="text-xs text-stone-500 mt-1">
                Upload video files or add Instagram reel links to feature real styling videos on your store!
              </p>
              <Button
                size="sm"
                onClick={() => setIsReelModalOpen(true)}
                className="mt-4 rounded-full bg-stone-900 text-white font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add First Reel
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => {
                    setPreviewReel(reel);
                    setIsModalPlaying(true);
                    setIsModalMuted(false);
                  }}
                  className="group relative flex flex-col rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-xl hover:border-amber-400/80 hover:shadow-2xl transition-all duration-300 text-white cursor-pointer"
                >
                  {/* 9:16 Video / Poster box */}
                  <div className="relative aspect-[9/16] w-full bg-stone-900 overflow-hidden">
                    {/* Always visible base image poster */}
                    <Image
                      src={reel.thumbnail || 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery/vibes/garba-glam.jpg'}
                      alt={reel.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Smooth video layer for direct video links */}
                    {reel.videoUrl && (
                      <video
                        src={reel.videoUrl}
                        preload="metadata"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => {
                          const v = e.target as HTMLVideoElement;
                          v.pause();
                          v.currentTime = 0;
                        }}
                        className="absolute inset-0 h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-black/20 to-black/60 pointer-events-none" />

                    {/* Top: Creator pill & Likes */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                      <div className="flex items-center gap-1.5 rounded-full bg-stone-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] text-stone-100 border border-white/15 shadow-sm">
                        <div className="relative h-4 w-4 overflow-hidden rounded-full border border-amber-400">
                          <Image src={reel.avatar || 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery/ui/avatar-ananya.jpg'} alt={reel.creator} fill sizes="16px" className="object-cover" />
                        </div>
                        <span className="font-bold truncate max-w-[85px]">{reel.handle || reel.creator}</span>
                      </div>

                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-pink-600/90 text-white backdrop-blur-md flex items-center gap-1 shadow-sm">
                        <Heart className="h-3 w-3 fill-white" /> {reel.likes}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-11 left-2.5 z-10 pointer-events-none">
                      {reel.videoUrl ? (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-md bg-emerald-600/90 text-white flex items-center gap-1 shadow-sm">
                          <Video className="h-2.5 w-2.5" /> MP4 Video
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-1 shadow-sm">
                          <Instagram className="h-2.5 w-2.5" /> Insta Link
                        </span>
                      )}
                    </div>

                    {/* Center play icon with glow */}
                    <div className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-950/60 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-xl group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-amber-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 pointer-events-none">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>

                    {/* Bottom: Caption & Tagged product */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-2 z-10 pointer-events-none">
                      <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow-md leading-snug">
                        {reel.title}
                      </p>

                      {reel.taggedProduct && (
                        <div className="flex items-center justify-between rounded-xl bg-white/95 backdrop-blur-md p-2 text-xs text-stone-900 shadow-lg border border-stone-200/50">
                          <div className="truncate mr-2">
                            <p className="truncate font-bold text-[11px] text-stone-900">{reel.taggedProduct.name}</p>
                            <p className="text-[10px] font-black text-rose-600">₹{reel.taggedProduct.price}</p>
                          </div>
                          <span className="rounded-lg bg-stone-900 p-1.5 text-white shrink-0 shadow-sm">
                            <ShoppingBag className="h-3 w-3" />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card footer actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between gap-1 text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewReel(reel);
                        setIsModalPlaying(true);
                        setIsModalMuted(false);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditReelModal(reel)}
                      className="px-2.5 py-1 text-[11px] font-bold text-stone-200 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg flex items-center gap-1 transition-colors"
                      title="Edit Reel details, captions or video file"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-amber-400" /> Edit
                    </button>

                    {reel.instagramUrl && (
                      <a
                        href={reel.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-pink-400 hover:text-pink-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-pink-950/40 transition-colors"
                      >
                        <Instagram className="h-3.5 w-3.5" /> Reel
                      </a>
                    )}

                    {reel.videoUrl && (
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(reel.videoUrl!, reel.id)}
                        className="text-[11px] font-bold text-stone-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-800 transition-colors"
                        title="Copy direct MP4 video URL"
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingReelId(reel.id)}
                      className="h-7 px-2 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded-lg ml-auto"
                      title="Delete Reel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── VIEW 2: STANDARD PHOTOS & ASSETS GRID ── */
        loading ? (
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
        )
      )}

      {/* ── Add New Reel & Video Modal ── */}
      {isReelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-pink-600 to-amber-600 text-white shadow-sm">
                  <Video className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Add Gen Z Styling Reel / Video</h2>
                  <p className="text-[11px] text-stone-500">Upload video to Supabase Storage or link Instagram Reel</p>
                </div>
              </div>
              <button
                onClick={() => setIsReelModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleReelSubmit} className="mt-4 space-y-4">
              {/* Creator Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Creator Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={reelCreator}
                    onChange={(e) => setReelCreator(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Instagram Handle</label>
                  <Input
                    type="text"
                    placeholder="e.g. @ananya.glam"
                    value={reelHandle}
                    onChange={(e) => setReelHandle(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Title / Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Reel Caption / Styling Description *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Garba night styling with Royal Chandbali jhumkas! 🌙✨"
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              {/* Likes & Instagram Link */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Likes Count</label>
                  <Input
                    type="text"
                    placeholder="e.g. 18.5K"
                    value={reelLikes}
                    onChange={(e) => setReelLikes(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Instagram className="h-3 w-3 text-pink-500" />
                    <span>Instagram Reel URL</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://www.instagram.com/reel/..."
                    value={reelInstagramUrl}
                    onChange={(e) => setReelInstagramUrl(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Video File Upload (Direct MP4 to Supabase Storage Bucket) */}
              <div className="space-y-1.5 border-t pt-3">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-emerald-600" />
                    <span>Upload Video File (MP4/WebM to Supabase Storage)</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal">Saves in videos/ folder</span>
                </label>

                <div
                  onClick={() => reelVideoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
                >
                  <input
                    ref={reelVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setReelVideoFile(f);
                        setReelVideoPreview(URL.createObjectURL(f));
                      }
                    }}
                    className="hidden"
                  />

                  {reelVideoFile ? (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-5 w-5" />
                      <span className="text-xs font-bold">{reelVideoFile.name} ({(reelVideoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Upload className="h-4 w-4 text-stone-400" />
                      <span className="text-xs font-medium">Click to select MP4 / WebM video clip</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tag Product in Store for 1-Click Buy */}
              <div className="space-y-1.5 border-t pt-3">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Tag Featured Jewellery Piece</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Enables 1-Click Buy on Video!</span>
                </label>
                <select
                  value={reelProductId}
                  onChange={(e) => setReelProductId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">-- Choose a jewellery piece --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReelModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingReel}
                  className="rounded-full bg-gradient-to-r from-pink-600 to-amber-600 hover:from-pink-700 hover:to-amber-700 text-white font-bold text-xs px-6 shadow-md"
                >
                  {isSavingReel ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving Reel...
                    </>
                  ) : (
                    'Save & Publish Reel'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Reel & Video Modal ── */}
      {isEditReelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 my-8">
            <div className="flex items-center justify-between border-b pb-3.5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-sm">
                  <Edit3 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Edit Styling Reel / Video</h2>
                  <p className="text-[11px] text-stone-500">Update creator, captions, tagged product, or replace video file</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditReelModalOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditReelSubmit} className="mt-4 space-y-4">
              {/* Creator Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Creator Name *</label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Ananya Sharma"
                    value={editReelCreator}
                    onChange={(e) => setEditReelCreator(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Instagram Handle</label>
                  <Input
                    type="text"
                    placeholder="e.g. @ananya.glam"
                    value={editReelHandle}
                    onChange={(e) => setEditReelHandle(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Title / Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Reel Caption / Styling Description *</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Garba night styling with Royal Chandbali jhumkas! 🌙✨"
                  value={editReelTitle}
                  onChange={(e) => setEditReelTitle(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              {/* Likes & Instagram Link */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Likes Count</label>
                  <Input
                    type="text"
                    placeholder="e.g. 18.5K"
                    value={editReelLikes}
                    onChange={(e) => setEditReelLikes(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                    <Instagram className="h-3 w-3 text-pink-500" />
                    <span>Instagram Reel URL</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://www.instagram.com/reel/..."
                    value={editReelInstagramUrl}
                    onChange={(e) => setEditReelInstagramUrl(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Video File / Direct Video URL */}
              <div className="space-y-2 border-t pt-3">
                <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-emerald-600" />
                    <span>Replace or Update Video File (MP4/WebM)</span>
                  </span>
                  <span className="text-[10px] text-stone-400">Direct upload to Supabase</span>
                </label>

                {/* Video Dropzone */}
                <div
                  onClick={() => editReelVideoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 p-3.5 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
                >
                  <input
                    ref={editReelVideoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setEditReelVideoFile(f);
                        setEditReelVideoPreview(URL.createObjectURL(f));
                      }
                    }}
                    className="hidden"
                  />

                  {editReelVideoFile ? (
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check className="h-5 w-5" />
                      <span className="text-xs font-bold">{editReelVideoFile.name} ({(editReelVideoFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : editReelVideoUrl ? (
                    <div className="flex items-center gap-2 text-stone-700">
                      <Video className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-medium truncate max-w-[320px]">Current Video: {editReelVideoUrl.split('/').pop()}</span>
                      <span className="text-[10px] text-amber-600 underline ml-1">Click to replace</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-stone-600">
                      <Upload className="h-4 w-4 text-stone-400" />
                      <span className="text-xs font-medium">Click to select replacement MP4 / WebM video</span>
                    </div>
                  )}
                </div>

                {/* Direct Video URL Textfield */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-500">Or Paste Direct MP4 Video URL</label>
                  <Input
                    type="url"
                    placeholder="https://.../video.mp4"
                    value={editReelVideoUrl}
                    onChange={(e) => setEditReelVideoUrl(e.target.value)}
                    className="h-8 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Tag Product in Store for 1-Click Buy */}
              <div className="space-y-1.5 border-t pt-3">
                <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Tag Featured Jewellery Piece</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Powers 1-Click Buy button</span>
                </label>
                <select
                  value={editReelProductId}
                  onChange={(e) => setEditReelProductId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  <option value="">-- Choose a jewellery piece --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditReelModalOpen(false)}
                  className="rounded-full text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingEditReel}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-bold text-xs px-6 shadow-md"
                >
                  {isSavingEditReel ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    'Update Reel'
                  )}
                </Button>
              </div>
            </form>
          </div>
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
                  accept="image/jpeg,image/png,image/webp,video/mp4"
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
                    <p className="text-xs font-bold text-stone-800">Drag &amp; drop or click to choose file</p>
                    <p className="text-[10px] text-stone-400">JPG, PNG, WEBP, or MP4 video</p>
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
                    <option value="videos">videos/ (Reels &amp; MP4 Clips)</option>
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
                  accept="image/jpeg,image/png,image/webp,video/mp4"
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
                    <p className="text-xs font-bold text-stone-800">Select replacement file</p>
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

      {/* ── Delete Confirm Modal (Image) ── */}
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

      {/* ── Delete Confirm Modal (Reel) ── */}
      {deletingReelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-rose-600 mb-3">
              <AlertCircle className="h-5 w-5" />
              <h3 className="text-sm font-bold text-stone-900">Delete Reel?</h3>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove this reel from the #JhumkaJunction IRL carousel?
            </p>

            <div className="flex items-center justify-end gap-2 mt-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingReelId(null)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteReelConfirm}
                disabled={isDeleting}
                className="rounded-full bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold"
              >
                {isDeleting ? 'Deleting...' : 'Delete Reel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Video & Reel Preview Modal ── */}
      {previewReel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in-0 duration-200"
          onClick={() => setPreviewReel(null)}
        >
          <div
            className="relative flex flex-col md:flex-row w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-stone-950 border border-stone-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setPreviewReel(null)}
              className="absolute top-4 right-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/90 hover:scale-105 transition-all border border-white/20"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left: 9:16 Video Player */}
            <div className="relative aspect-[9/16] w-full md:w-[320px] shrink-0 bg-black overflow-hidden flex items-center justify-center">
              {previewReel.videoUrl ? (
                <video
                  ref={adminVideoRef}
                  src={previewReel.videoUrl}
                  poster={previewReel.thumbnail}
                  autoPlay
                  loop
                  playsInline
                  muted={isModalMuted}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={previewReel.thumbnail || 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery/vibes/garba-glam.jpg'}
                  alt={previewReel.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              )}

              {/* Sound toggle overlay if video */}
              {previewReel.videoUrl && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (adminVideoRef.current) {
                      adminVideoRef.current.muted = !adminVideoRef.current.muted;
                      setIsModalMuted(adminVideoRef.current.muted);
                    }
                  }}
                  className="absolute top-4 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all border border-white/20"
                  title={isModalMuted ? 'Unmute' : 'Mute'}
                >
                  {isModalMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-emerald-400" />}
                </button>
              )}
            </div>

            {/* Right: Reel Meta & Product Details */}
            <div className="flex-1 p-6 flex flex-col justify-between bg-stone-900 text-white space-y-4 overflow-y-auto">
              <div>
                <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-amber-400 shadow-md">
                    <Image
                      src={previewReel.avatar || 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery/ui/avatar-ananya.jpg'}
                      alt={previewReel.creator}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{previewReel.creator}</h3>
                    <p className="text-xs text-amber-400 font-medium">{previewReel.handle}</p>
                  </div>
                  <span className="ml-auto px-2.5 py-1 text-xs font-black rounded-full bg-pink-600/90 text-white flex items-center gap-1 shadow-sm">
                    <Heart className="h-3 w-3 fill-white" /> {previewReel.likes}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-stone-200 leading-relaxed font-sans">{previewReel.title}</p>
                  <p className="text-[11px] text-stone-500 font-mono">#JhumkaJunction #OxidisedJewellery #FestiveDrop</p>
                </div>

                {previewReel.instagramUrl && (
                  <div className="mt-4">
                    <a
                      href={previewReel.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-pink-950/50 border border-pink-500/40 px-3.5 py-2 text-xs font-bold text-pink-200 hover:text-white hover:bg-pink-900/60 transition-all"
                    >
                      <Instagram className="h-4 w-4 text-pink-400" />
                      <span>View original styling reel on Instagram</span>
                      <ExternalLink className="h-3 w-3 ml-1 text-stone-400" />
                    </a>
                  </div>
                )}
              </div>

              {previewReel.taggedProduct && (
                <div className="rounded-2xl bg-stone-950 border border-stone-800 p-4 space-y-3 shadow-xl">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Featured Jewellery Piece
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-stone-800 bg-stone-900">
                      <Image
                        src={previewReel.taggedProduct.image || 'https://ahfsgcxydbuaxvnvtjtn.supabase.co/storage/v1/object/public/jewellery/categories/chandbali-jhumkas.jpg'}
                        alt={previewReel.taggedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{previewReel.taggedProduct.name}</p>
                      <p className="text-sm font-black text-amber-300 mt-0.5">₹{previewReel.taggedProduct.price}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
