import { NextRequest, NextResponse } from 'next/server';
import { searchGameByTitle } from '@/lib/igdb';

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json({ error: 'Missing or invalid title' }, { status: 400 });
    }

    const game = await searchGameByTitle(title);
    return NextResponse.json({ url: game?.url ?? null });
  } catch (err) {
    console.error('IGDB game lookup failed:', err);
    return NextResponse.json({ url: null }, { status: 200 });
  }
}
