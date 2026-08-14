import { NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
  const host = url ? (url.split('@')[1] || '').split('/')[0] : 'MISSING_ENV';

  try {
    const data = await db.select().from(products);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: `[DB Host: ${host}] ${error?.message || String(error)}`
      },
      { status: 500 }
    );
  }
}
