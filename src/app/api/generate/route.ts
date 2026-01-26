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

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error generating wrapped content:', error);
    
    // Extract error message and determine appropriate status code
    let statusCode = 500;
    let errorMessage = 'Failed to generate wrapped content';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('UNAVAILABLE') || error.message.includes('503') || error.message.includes('overloaded')) {
        statusCode = 503;
        errorMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
      } else if (error.message.includes('UNAUTHENTICATED') || error.message.includes('401')) {
        statusCode = 401;
        errorMessage = 'Authentication failed. Please check your API configuration.';
      } else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('403')) {
        statusCode = 403;
        errorMessage = 'Permission denied. Please check your API permissions.';
      } else if (error.message.includes('INVALID_ARGUMENT') || error.message.includes('400')) {
        statusCode = 400;
        errorMessage = 'Invalid request. Please check your input and try again.';
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
