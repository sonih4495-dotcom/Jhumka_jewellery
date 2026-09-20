// lib/uploader.ts
import sharp from 'sharp';
import { supabaseAdmin, SUPABASE_STORAGE_BUCKET } from './supabase';

const BUCKET_NAME = SUPABASE_STORAGE_BUCKET;

export interface UploadResult {
  url: string;
  key: string;
  size: number;
}

export interface ImageVariant {
  width: number;
  height: number;
  suffix: string;
}

// Image variants for different use cases
export const IMAGE_VARIANTS: Record<string, ImageVariant> = {
  thumbnail: { width: 300, height: 300, suffix: '_thumb' },
  medium: { width: 600, height: 600, suffix: '_medium' },
  large: { width: 1200, height: 1200, suffix: '_large' },
} as const;

// Allowed file types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
] as const;

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Validate file
export const validateFile = (
  file: File,
  type: 'image' | 'document' = 'image'
) => {
  const allowedTypes =
    type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

  if (!(allowedTypes as readonly string[]).includes(file.type)) {
    throw new Error(
      `Invalid file type (${file.type}). Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  if (file.size > maxSize) {
    throw new Error(
      `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
    );
  }

  return true;
};

// Generate unique filename
export const generateFileName = (originalName: string, folder = '') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  const extension = originalName.split('.').pop();
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

  const fileName = `${baseName}_${timestamp}_${randomString}.${extension}`;
  return folder ? `${folder}/${fileName}` : fileName;
};

// Upload buffer/file directly to Supabase Bucket
export const uploadToSupabase = async (
  file: Buffer | Uint8Array,
  path: string,
  contentType: string,
  bucket: string = BUCKET_NAME
): Promise<UploadResult> => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(cleanPath, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed for ${cleanPath}: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(cleanPath);

  return {
    url: publicUrlData.publicUrl,
    key: cleanPath,
    size: file.length,
  };
};

// Delete file from Supabase Bucket
export const deleteFromSupabase = async (
  path: string,
  bucket: string = BUCKET_NAME
): Promise<void> => {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([cleanPath]);

  if (error) {
    console.error(`Failed to delete ${cleanPath} from Supabase:`, error.message);
  }
};

// Process and upload image with variants
export const uploadImageWithVariants = async (
  file: File,
  folder = 'products',
  bucket: string = BUCKET_NAME
): Promise<{
  original: UploadResult;
  variants: Record<string, UploadResult>;
}> => {
  validateFile(file, 'image');

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = generateFileName(file.name, folder);
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  const extension = fileName.split('.').pop();

  // Upload original
  const original = await uploadToSupabase(buffer, fileName, file.type, bucket);

  // Create and upload variants
  const variants: Record<string, UploadResult> = {};

  for (const [variantName, config] of Object.entries(IMAGE_VARIANTS)) {
    try {
      const resizedBuffer = await sharp(buffer)
        .resize(config.width, config.height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      const variantKey = `${baseName}${config.suffix}.${extension}`;
      variants[variantName] = await uploadToSupabase(
        resizedBuffer,
        variantKey,
        'image/jpeg',
        bucket
      );
    } catch (error) {
      console.error(`Failed to create ${variantName} variant:`, error);
    }
  }

  return { original, variants };
};

// Upload single file (image or document or json data)
export const uploadFile = async (
  file: File,
  folder = 'uploads',
  type: 'image' | 'document' = 'image',
  bucket: string = BUCKET_NAME
): Promise<UploadResult> => {
  validateFile(file, type);

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = generateFileName(file.name, folder);

  return await uploadToSupabase(buffer, fileName, file.type, bucket);
};

// Extract key/path from public URL
export const extractKeyFromUrl = (url: string, bucket: string = BUCKET_NAME): string => {
  const marker = `/storage/v1/object/public/${bucket}/`;
  if (url.includes(marker)) {
    return url.split(marker)[1] || '';
  }
  return url;
};

// Delete image and its variants
export const deleteImageWithVariants = async (
  originalUrl: string,
  bucket: string = BUCKET_NAME
): Promise<void> => {
  const key = extractKeyFromUrl(originalUrl, bucket);
  const baseName = key.replace(/\.[^/.]+$/, '');

  // Delete original
  await deleteFromSupabase(key, bucket);

  // Delete variants
  const variantKeys = Object.values(IMAGE_VARIANTS).map(
    config => `${baseName}${config.suffix}.jpg`
  );
  for (const vKey of variantKeys) {
    await deleteFromSupabase(vKey, bucket);
  }
};

// Batch delete files
export const batchDelete = async (
  urls: string[],
  bucket: string = BUCKET_NAME
): Promise<void> => {
  const paths = urls.map(url => extractKeyFromUrl(url, bucket));
  await supabaseAdmin.storage.from(bucket).remove(paths);
};

// Backward compatibility alias
export const uploadToS3 = uploadToSupabase;
export const deleteFromS3 = deleteFromSupabase;
