import { Suspense } from 'react';
import Loading from './loading';
import WrappedPageClient from './wrapped-page-client';
import { Metadata } from 'next';
import { getWrapped } from '@/lib/db';
import { WrappedData } from '@/types';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const id = params.id as string;

  if (!id) {
    return {
      title: 'Gaming Wrapped',
      description: 'Your year in gaming summary.',
    };
  }

  const wrapped = await getWrapped(id);
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

  const ogImageUrl = `${host}/api/wrapped/${id}/og`;
  const pageUrl = `${host}/wrapped?id=${id}`;
  
  // Extract stats for richer metadata
  const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
  const personaCard = wrapped.cards.find((c: any) => c.type === 'player_persona');
  const topGameCard = wrapped.cards.find((c: any) => c.type === 'top_game');

  const persona = personaCard?.persona || 'Gamer';
  const topGame = topGameCard?.game?.title || 'Unknown Game';
  const totalGames = summaryCard?.totalGames ?? 0;
  const playtime = (totalGames * 20).toLocaleString();

  const title = `Gaming Wrapped 2025: ${persona}`;
  const description = `I played ${totalGames} games (mostly ${topGame}) for over ${playtime} hours this year! Check out my Gaming Wrapped.`;
  const imageAlt = `Gaming Wrapped 2025 Summary for a ${persona}. Featured Game: ${topGame}. Total Games: ${totalGames}.`;

  return {
    metadataBase: safeHost,
    title,
    description,
    keywords: ['Gaming Wrapped', 'Year in Review', '2025', 'Video Games', persona, topGame],
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
  let initialData: WrappedData | null = null;

  if (id) {
    initialData = (await getWrapped(id)) as WrappedData | null;
  }

  return (
    <Suspense fallback={<Loading />}>
      <WrappedPageClient initialData={initialData} initialId={id} />
    </Suspense>
  );
}