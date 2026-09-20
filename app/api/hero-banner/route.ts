import { NextResponse } from 'next/server';
import { getStoredHeroBanner } from '@/server/banner-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banner = getStoredHeroBanner();
    return NextResponse.json({ success: true, banner });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get hero banner' },
      { status: 500 }
    );
  }
}
