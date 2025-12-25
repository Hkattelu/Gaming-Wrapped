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

  // Find playtime if available
  const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
  const totalGames = summaryCard?.totalGames ?? 0;
  const playtime = totalGames * 20; // Consistent with UI estimate

  return {
    title: 'My Gaming Wrapped 2025',
    description: `I played ${totalGames} games for over ${playtime} hours this year! Check out my Gaming Wrapped.`,
    openGraph: {
      title: 'My Gaming Wrapped 2025',
      description: `I played ${totalGames} games for over ${playtime} hours this year!`,
      images: [
        {
          url: `/api/wrapped/${id}/og`,
          width: 1200,
          height: 630,
          alt: 'Gaming Wrapped Summary',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My Gaming Wrapped 2025',
      description: `I played ${totalGames} games for over ${playtime} hours this year!`,
      images: [`/api/wrapped/${id}/og`],
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