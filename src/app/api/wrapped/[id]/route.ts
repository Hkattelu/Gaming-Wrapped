import { NextRequest, NextResponse } from 'next/server';
import { getWrapped } from '@/lib/db';

type Params = Promise<{id: string}>;

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const wrapped = await getWrapped(id);

    if (!wrapped) {
      return NextResponse.json({ error: 'Wrapped content not found' }, { status: 404 });
    }

    return NextResponse.json({ wrapped });
  } catch (error) {
    console.error('Error retrieving wrapped content:', error);
    return NextResponse.json({ error: 'Failed to retrieve wrapped content' }, { status: 500 });
  }
}
