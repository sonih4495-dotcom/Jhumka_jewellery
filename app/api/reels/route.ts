import { NextResponse } from 'next/server';
import { getStoredReels } from '@/lib/reels-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reels = getStoredReels();
    return NextResponse.json({ success: true, reels });
  } catch (error: any) {
    console.error('Failed to fetch public reels:', error);
    return NextResponse.json({ error: 'Failed to fetch reels' }, { status: 500 });
  }
}
