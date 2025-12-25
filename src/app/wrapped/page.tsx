import { Suspense } from 'react';
import Loading from './loading';
import WrappedPageClient from './wrapped-page-client';
import { Metadata } from 'next';
import { getWrapped } from '@/lib/db';

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
  const title = 'My Gaming Wrapped 2025';

  // Find playtime if available
  const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
  const totalGames = summaryCard?.totalGames ?? 0;
  const playtime = totalGames * 20; 
  const description = `I played ${totalGames} games for over ${playtime} hours this year! Check out my Gaming Wrapped.`;

  return {
    metadataBase: safeHost,
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Gaming Wrapped',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Gaming Wrapped Summary',
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
  let initialData = null;

  if (id) {
    initialData = await getWrapped(id);
  }

  return (
    <Suspense fallback={<Loading />}>
      <WrappedPageClient initialData={initialData} initialId={id} />
    </Suspense>
  );
}