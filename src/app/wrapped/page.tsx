import { Suspense } from 'react';
import Loading from './loading';
import WrappedPageClient from './wrapped-page-client';
import { Metadata } from 'next';
import { getWrapped } from '@/lib/db';
import { WrappedData } from '@/types';
import { MOCK_WRAPPED_OUTPUT } from '@/ai/dev-wrapped';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const id = params.id as string;
  const isDemo = params.demo === 'true';

  if (!id && !isDemo) {
    return {
      title: 'Gaming Wrapped',
      description: 'Your year in gaming summary.',
    };
  }

  const wrapped = isDemo ? MOCK_WRAPPED_OUTPUT : await getWrapped(id);
  if (!wrapped) {
    return {
      title: 'Gaming Wrapped',
      description: 'Your year in gaming summary.',
    };
  }

  const host = process.env.HOST_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:9002' : 'https://gamingwrapped.com');
  
  // Ensure host is a valid URL for metadataBase
  let safeHost;
  try {
    safeHost = new URL(host);
  } catch (e) {
    safeHost = new URL('http://localhost:9002');
  }

  const ogImageUrl = isDemo ? `${host}/icon.svg` : `${host}/api/wrapped/${id}/og`;
  const pageUrl = isDemo ? `${host}/wrapped?demo=true` : `${host}/wrapped?id=${id}`;
  
  // Extract stats for richer metadata
  const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
  const personaCard = wrapped.cards.find((c: any) => c.type === 'player_persona');
  const topGameCard = wrapped.cards.find((c: any) => c.type === 'top_game');

  const persona = personaCard?.persona || 'Gamer';
  const topGame = topGameCard?.game?.title || 'Unknown Game';
  const totalGames = summaryCard?.totalGames ?? 0;
  const playtime = (totalGames * 20).toLocaleString();

  const title = `Gaming Wrapped: ${persona}`;
  const description = `I played ${totalGames} games (mostly ${topGame}) for over ${playtime} hours! Check out my Gaming Wrapped.`;
  const imageAlt = `Gaming Wrapped Summary for a ${persona}. Featured Game: ${topGame}. Total Games: ${totalGames}.`;

  return {
    metadataBase: safeHost,
    title,
    description,
    keywords: ['Gaming Wrapped', 'Year in Review', 'Video Games', persona, topGame],
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Gaming Wrapped',
      locale: 'en_US',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function WrappedPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id as string;
  const isDemo = params.demo === 'true';
  let initialData: WrappedData | null = null;

  if (isDemo) {
    initialData = MOCK_WRAPPED_OUTPUT as WrappedData;
  } else if (id) {
    initialData = (await getWrapped(id)) as WrappedData | null;
  }

  return (
    <Suspense fallback={<Loading />}>
      <WrappedPageClient initialData={initialData} initialId={id || (isDemo ? 'demo' : null)} />
    </Suspense>
  );
}