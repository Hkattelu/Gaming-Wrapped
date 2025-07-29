
"use client";

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import type { WrappedData } from '@/types';
import { WrappedSlideshow } from '@/components/wrapped-slideshow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Loading from './loading';
import { useRouter, useSearchParams } from 'next/navigation';

function WrappedPageContent() {
  const [data, setData] = useState<WrappedData | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const searchId = searchParams.get('id');

    if (searchId) {
      setId(searchId);
      fetch(`/api/wrapped/${searchId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch wrapped data');
          }
          return response.json();
        })
        .then(data => {
          setData(data.wrapped);
          setIsLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setIsLoading(false);
        });
    } else {
      const storedData = sessionStorage.getItem('wrappedData');
      const storedId = sessionStorage.getItem('wrappedId');
      if (storedData && storedId) {
        try {
          const parsedData: WrappedData = JSON.parse(storedData);
          setData(parsedData);
          setId(storedId);
          router.push(`/wrapped?id=${storedId}`);
        } catch (e) {
          setError('Failed to load your Game Rewind. The data format is invalid.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setError('No Game Rewind data found. Please start over.');
        setIsLoading(false);
      }
    }
  }, [searchParams, router]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Try Again</Link>
        </Button>
      </div>
    );
  }

  if (data) {
    return <WrappedSlideshow data={data} id={id} />;
  }

  return null;
}

export default function WrappedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <WrappedPageContent />
    </Suspense>
  );
}
