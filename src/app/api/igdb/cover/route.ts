import { NextRequest, NextResponse } from 'next/server';
import { searchCoverByTitle } from '@/lib/igdb';

export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();
    if (!title || typeof title !== 'string' || title.trim().length < 1) {
      return NextResponse.json({ error: 'Missing or invalid title' }, { status: 400 });
    }

    const imageUrl = await searchCoverByTitle(title);
    return NextResponse.json({ imageUrl });
  } catch (err) {
    console.error('IGDB cover lookup failed:', err);
    return NextResponse.json({ imageUrl: null }, { status: 200 });
  }
}
