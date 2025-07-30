import { NextRequest, NextResponse } from 'next/server';
import { generateGamingWrapped } from '@/ai/flows/generate-gaming-wrapped';
import { saveWrapped } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { games } = await req.json();

    if (!games || !Array.isArray(games)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const wrapped = await generateGamingWrapped({ games });
    const id = await saveWrapped(wrapped);

    return NextResponse.json({ id, wrapped });
  } catch (error) {
    console.error('Error generating wrapped content:', error);
    return NextResponse.json({ error: 'Failed to generate wrapped content' }, { status: 500 });
  }
}
