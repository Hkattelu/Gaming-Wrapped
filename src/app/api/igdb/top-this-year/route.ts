import { NextRequest, NextResponse } from 'next/server';
import { getTopGamesOfYear } from '@/lib/igdb';

export async function GET() {
  try {
    const now = new Date();
    const year = now.getUTCFullYear();
    const suggestions = await getTopGamesOfYear(year, 8);
    return NextResponse.json({ suggestions: suggestions ?? [] });
  } catch (err) {
    console.error('IGDB top-this-year failed:', err);
    return NextResponse.json({ suggestions: [] });
  }
}
