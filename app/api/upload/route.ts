// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  uploadImageWithVariants,
  uploadFile,
  validateFile,
  uploadToSupabase,
} from '@/lib/uploader';
import { SUPABASE_STORAGE_BUCKET } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check authentication if session exists
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      // If unauthenticated, allow only if internal or admin, or return 401
      // For general upload endpoint, require user session
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to upload files.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';
    const type = (formData.get('type') as 'image' | 'document') || 'image';
    const createVariants = formData.get('variants') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file
    validateFile(file, type);

    if (type === 'image' && createVariants) {
      const result = await uploadImageWithVariants(file, folder, SUPABASE_STORAGE_BUCKET);
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${folder}/${timestamp}_${cleanName}`;

    const result = await uploadToSupabase(
      buffer,
      path,
      file.type,
      SUPABASE_STORAGE_BUCKET
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
